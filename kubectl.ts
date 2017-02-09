/// <reference path="typings/globals/node/index.d.ts" />
"use strict"

import tl = require('vsts-task-lib/task');
import path = require('path');

import fs = require('fs');
import { ToolRunner } from 'vsts-task-lib/toolrunner';

export class KubectlCommand {
    endpoint: string;
    kubeconfig: string;
    kubectlbinary: string;
    configfile: string;
    kubectl: ToolRunner;

    constructor() {
        this.endpoint = tl.getInput('k8sService');
        this.kubeconfig = tl.getEndpointAuthorizationParameter(this.endpoint, 'kubeconfig', true);
        this.kubectlbinary = tl.getInput('kubectlBinary');
        this.configfile = path.join(tl.cwd(), "config");
        this.kubectl = tl.tool(this.kubectlbinary);
    }
    append(arg) {
        this.kubectl.arg(arg);
    }
    exec() {
        this.execCommand();
    }
    async execCommand() {
        try {
            tl.checkPath(this.kubectlbinary, 'kubectlBinary');
            tl.debug("cwd(): " + tl.cwd());
            tl.debug("configfile: " + this.configfile);
            await fs.writeFile(this.configfile, this.kubeconfig);
            this.kubectl.arg('--kubeconfig').arg('./config');

            await this.kubectl.exec();

            tl.setResult(tl.TaskResult.Succeeded, "kubectl works.");
            return;
        } catch (err) {
            tl.setResult(tl.TaskResult.Failed, err);
        }
    }
}