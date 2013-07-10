#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + restler
   - https://registry.npmjs.org/restler

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
//    console.log(fs.readFileSync(htmlfile).toString());
    return cheerio.load(fs.readFileSync(htmlfile));
};

var restlerHtmlFile = function(url) {
    return rest.get(url).on('complete', function(data) {
/* ugly, but... restler is asynchronous, how else to we do it? */
//        console.log(data);
        var checkJson = checkHtmlFile(cheerio.load(data), program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
        return data;
    });
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
//    console.log(htmlfile);
    $ = htmlfile;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_file>', 'URL to index.html', undefined)
        .parse(process.argv);

    var checkJson;
    if(program.url) {
//          console.log('program.url is defined');
          restlerHtmlFile(program.url);
//          checkJson = checkHtmlFile(cheerio.load(myGlobal), program.checks);
    }
    else {
//          console.log('program.url is NOT defined');
          checkJson = checkHtmlFile(cheerioHtmlFile(program.file), program.checks);
          var outJson = JSON.stringify(checkJson, null, 4);
          console.log(outJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
