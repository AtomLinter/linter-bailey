'use babel';

let bailey;
let helpers;

const levelMapping = {
  SyntaxError: 'error',
  ImportError: 'error',
  StyleError: 'warning',
};

const formatMessage = (error) => {
  if (error.found) return `Found unexpected ${error.inner}`;
  return error.message;
};

const loadDeps = () => {
  if (!bailey) {
    bailey = require('bailey');
  }
  if (!helpers) {
    helpers = require('atom-linter');
  }
};

export default {
  activate() {
    this.idleCallbacks = new Set();
    let depsCallbackID;
    const installLinterBaileyDeps = () => {
      this.idleCallbacks.delete(depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-bailey');
      }
      loadDeps();
      if (atom.inDevMode()) {
        // eslint-disable-next-line no-console
        console.log('linter-bailey: All dependencies installed.');
      }
    };
    depsCallbackID = window.requestIdleCallback(installLinterBaileyDeps);
    this.idleCallbacks.add(depsCallbackID);

    if (atom.inDevMode()) {
      // eslint-disable-next-line no-console
      console.log('linter-bailey: bailey linter is now activated.');
    }
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
  },

  provideLinter() {
    return {
      name: 'bailey',
      grammarScopes: [
        'source.bs',
      ],
      scope: 'file',
      lintsOnChange: true,
      lint: async (editor) => {
        const filePath = editor.getPath();
        if (!filePath) {
          // Somehow a TextEditor without a path was passed in
          return null;
        }

        const fileText = editor.getText();
        loadDeps();

        const messages = [];
        try {
          bailey.parseString(fileText);
        } catch (e) {
          if (e instanceof bailey.ParserError) {
            messages.push({
              severity: levelMapping[e.inner.name] || 'error',
              excerpt: formatMessage(e),
              location: {
                file: filePath,
                position: helpers.generateRange(editor, e.line - 1, e.col - 1),
              },
            });
          }
        }

        if (editor.getText() !== fileText) {
          // Editor contents have changed, tell Linter not to update
          return null;
        }

        return messages;
      },
    };
  },
};
