const core = require('@actions/core');
const github = require('@actions/github');
const tsLinter = require('tslint');

try {
    const payload = JSON.parse(github.context.payload);
    console.log(payload);
    const linterAction = (() => {
        const projectFolder = core.getInput('working-directory');
        const configFile = core.getInput('config');
        const rulesFile = core.getInput('rules');
        const options = {fix: false, formatter: 'json'};

        if (projectFolder) {
            process.chdir('/tree/' + payload.tree_id + projectFolder);
            console.log('New directory: ' + process.cwd());
        }

        const linterInstance = tsLinter.Linter.createProgram(configFile);
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
        core.setFailed('Linter found errors.');
    }
} catch (error) {
    core.setFailed(error.message);
}
