const core = require('@actions/core');
const github = require('@actions/github');
const tsLinter = require('tslint');

const configFile = 'tsconfig.json';
const rulesFile = 'tslint.json';
const gitHubToken = core.getInput('token');
const folder = core.getInput("folder");
const options = {fix: false, formatter: 'json'};

try {
    const linterAction = (() => {
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        console.log(`The event payload: ${payload}`);

        const linterInstance = tsLinter.Linter.createProgram(configFile, folder);
        const linter = new tsLinter.Linter(options, linterInstance);
        const files = tsLinter.Linter.getFileNames(linterInstance);
        console.log('Found ' + files.length + ' files.');

        files.map(file => {
            const sourceFile = linterInstance.getSourceFile(file);
            console.log('Checking: ' + file);
            const fileContent = sourceFile.getFullText();
            const configuration = tsLinter.Configuration.findConfiguration(rulesFile, file).results;
            linter.lint(file, fileContent, configuration);
        });
        return linter.getResult();
    })();

    const result = [];
    linterAction.failures.map(failure => {
        result.push({
            file: failure.getFileName(),
            rule: failure.getRuleName(),
            description: failure.getFailure(),
            position: failure.getStartPosition().getLineAndCharacter()
        });
    });

    if (result.length) {
        console.log('Total amount of errors: ' + linterAction.errorCount);
        console.log(result);

        const context = github.context;
        const pull_request_number = context.payload.pull_request.number;
        const octokit = new github.GitHub(gitHubToken);
        octokit.issues.createComment({
            ...context.repo,
            issue_number: pull_request_number,
            body: result
        });

        core.setFailed('Linter found errors.');
    }
} catch (error) {
    core.setFailed(error.message);
}
