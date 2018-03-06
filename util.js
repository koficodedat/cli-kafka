const fs = require('fs');

function dirExists(path) {

    try{
        return fs.statSync(path).isDirectory();
    }
    catch (e){
        if( e.code === 'ENOENT' ) return false;
        throw e;
    }

}

function fileExists(path) {

    try{
        return fs.statSync(path).isFile;
    }
    catch (e){
        if( e.code === 'ENOENT' ) return false;
        throw e;
    }

}

module.exports = {
    dirExists: dirExists,
    fileExists: fileExists
}