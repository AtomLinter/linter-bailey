linterPath = atom.packages.getLoadedPackage("linter").path
Linter = require "#{linterPath}/lib/linter"
bailey = require 'bailey'

module.exports =
  class LinterBailey extends Linter
    @syntax: 'source.bs'
    linterName: 'bailey'
    cmd: 'bailey -v @filename @filename.out'
    errorStream: 'stderr'
    regex: 'SyntaxError at .* line (?<line>[0-9]+), character (?<col>[0-9]+):'
