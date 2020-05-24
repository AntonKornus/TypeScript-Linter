const core = require('@actions/core');
const tsLinter = require('tslint');
const glob = require("glob");
const fs = require('fs');

try {
    const lintAction = (() => {
        const configFile = core.getInput('config');
        const pattern = core.getInput('pattern');
        const files = glob.sync(pattern);
        console.log('Found ' + files.length + ' files.');

        const options = {fix: false, formatter: 'json'};
        const linter = new tsLinter.Linter(options);
        files.map(file => {
            console.log('Checking: ' + file);
            const fileContent = fs.readFileSync(file, {encoding: 'utf8'});
            const configuration = tsLinter.Configuration.findConfiguration(configFile, file).results;
            linter.lint(file, fileContent, configuration);
        });
        console.log(linter.getResult());
        return linter.getResult();
    })();

    const result = [];
    lintAction.failures.map(failure => {
        result.push({
            file: failure.getFileName(),
            rule: failure.getRuleName(),
            description: failure.getFailure(),
            position: failure.getStartPosition().getLineAndCharacter()
        });
    });

    if (result.length) {
        console.log(result);
        core.setFailed();
    }
} catch (error) {
    core.setFailed(error.message);
}
