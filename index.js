"use strict";

function PhabricatorCoverageReport(opts) {
  debugger;
  console.log("OPTIONS:");
  console.log(JSON.stringify(opts));

  this.file = opts.file || "phabricator_data.json";
  this.format = opts.format === "json" ?  "json": "uri" ;
  this.summaries = {};
}

PhabricatorCoverageReport.prototype.onDetail = function(node, context) {
  var fileCoverage = node.getFileCoverage();
  var lineCoverage = fileCoverage.getLineCoverage();
  var covered = [];

  Object.keys(lineCoverage).forEach(function(lineNumber) {
    // Line numbers start at one
    var number = parseInt(lineNumber, 10) - 1;
    covered[number] = lineCoverage[lineNumber] ? "C" : "U";
  });

  for (var i = 0; i < covered.length; i++) {
    if (!covered[i]) {
      covered[i] = "N";
    }
  }

  this.summaries[fileCoverage.path] = covered.join("");
};

PhabricatorCoverageReport.prototype.onEnd = function(_, context) {
  this.contentWriter = context.writer.writeFile(this.file);
  if (this.format === "json") {
    this.contentWriter.write(JSON.stringify(this.summaries));
  } else {
    var params = [];
    var summaries = this.summaries;
    Object.keys(this.summaries).forEach(function(path) {
      // Removing "/app/" from the beginning of the path
      params.push(
        "unit[0][coverage][" + encodeURIComponent(path.substr(5)) + "]=" + summaries[path]
      );
    });
    this.contentWriter.write(params.join("&"));
  }
  this.contentWriter.close();
};

module.exports = PhabricatorCoverageReport;
