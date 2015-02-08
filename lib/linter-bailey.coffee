linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"
bailey = require 'bailey'
fs = require 'fs'

module.exports =
  class LinterBailey extends Linter
    @syntax: 'source.bs'
    linterName: 'bailey'

    levels:
      SyntaxError: 'error'
      ImportError: 'error'
      StyleError: 'warning'

    formatMessage: (error) ->
      if error.found
        return "Found unexpected '#{error.found}'"
      return error.message

    lintFile: (path, callback) ->
      messages = []
      fs.readFile path, (err, data) =>
        try
          bailey.parseString(data.toString())
        catch e
          if e instanceof bailey.ParserError

            messages.push({
              level: @levels[e.inner.name],
              line: e.line,
              col: e.column,
              linter: @linterName,
              message: @formatMessage(e),
              range: @computeRange({
                line: e.line,
                col: e.column,
              })
            })
        callback messages
