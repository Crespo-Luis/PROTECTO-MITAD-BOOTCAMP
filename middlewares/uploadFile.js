const multer = require('multer');

let uploadFile = (folder) =>{
    

    const storage = multer.diskStorage({
        destination: `public/images/${folder}`,
        filename: (req, file, cb)=>{
            let originalName = file.originalname;
            let newFileName = Date.now()+ "-" + originalName
            cb(null, newFileName)
        }
    })

    const upload = multer({ storage: storage}).single("img");

    return upload;
}

module.exports = uploadFile;

