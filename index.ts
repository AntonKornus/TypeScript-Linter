const core = require('@actions/core');
const tsLinter = require("tslint");
const glob = require("glob");
const fs = require("fs");

try {
    const lintAction = (() => {
        const options = {fix: false, formatter: 'json'};
        const files = glob.sync('*.ts');
        console.log('Found ' + files.length + ' files.');

        const linter = new tsLinter.Linter(options);
        files.map(file => {
            console.log('Checking: ' + file);
            const fileContent = fs.readFileSync(file, {encoding: 'utf8'});
            const config = tsLinter.Configuration.findConfiguration('tslint.json', file).results;
            linter.lint(file, fileContent, config);
        });
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
    core.setOutput('result', result);
} catch (error) {
    core.setFailed(error.message);
}
