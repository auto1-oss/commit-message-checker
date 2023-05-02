/*
 * This file is part of the "GS Commit Message Checker" Action for Github.
 *
 * Copyright (C) 2019-2022 by Gilbertsoft LLC (gilbertsoft.org)
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * For the full license information, please read the LICENSE file that
 * was distributed with this source code.
 */

/**
 * Imports
 */
import * as core from '@actions/core'
import * as inputHelper from './input-helper'
import * as commitMessageChecker from './commit-message-checker'
import * as yaml from 'js-yaml'
import ffs from 'fs';
const { promises: fs } = require('fs')

/**
 * Main function
 */
async function run(): Promise<void> {
  try {
    const checkerArguments = await inputHelper.getInputs()
    const required_workflow_override_configpath = core.getInput('RequiredWorkflowOverride')
    if (required_workflow_override_configpath.trim().length > 0 && ffs.existsSync(required_workflow_override_configpath.trim())) {
      let content = await fs.readFile(required_workflow_override_configpath, 'utf8')
      content = content.trim()
      core.debug(content)
      let yamlData = yaml.load(content)
      if (yamlData == null || yamlData == undefined) {
        core.setFailed('Error in reading the yaml file')
        return
      }   
      interface required_workflow_override_override_obj {
        commit_message_compliance_checker: {
          description: string,
          Disable: boolean
        }
      }   
      let required_workflow_override_override_config: required_workflow_override_override_obj = JSON.parse(JSON.stringify(yamlData, null, 2));
      if (required_workflow_override_override_config.commit_message_compliance_checker.Disable == true) {
        core.info("required_workflow_override_override set to disable, hence skipping ")
        return
      }      
      if (checkerArguments.messages.length === 0) {
        core.info(`No commits found in the payload for relevent included users, skipping check.`)
      } else {
        await commitMessageChecker.checkCommitMessages(checkerArguments)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      throw error // re-throw the error unchanged
    }
  }
}

/**
 * Main entry point
 */
run()
