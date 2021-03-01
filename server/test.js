var fs = require('fs');
var myFile = fs.readFile('./text.txt', {encoding: 'utf8'}, function(err, data) {
    console.log(data);
    fs.writeFile('./text.txt', data + '\n' + 'fermi, play zelda', function(err) {
        console.log(err);
    });
});


