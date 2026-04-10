const connection = require("../config/db");
const bcrypt = require("bcrypt");

class IndexController {

  home = (req, res)=> {
  let sql = 'SELECT * FROM user '
    connection.query(sql, (err, result)=>{
        if(err){
            throw err;
        }else{
            console.log("***********************",result);
            
            res.render("index", {users: result});
        }
    })
  };

showRegister = (req, res) => {
  
  res.render("register");
  };
  register = (req, res) => {
    const { name, lastname, email, password, description } = req.body;

    if(!name || !lastname || !email || !password || !description){
        res.render('register', {message: "Debes rellenar todos los campos"})
    }else{
        bcrypt.hash(password.trim(), 10, (errHash, hashedPassword) => {
            if (errHash) {
                throw errHash;
            } else {
                let sql =
                "INSERT INTO user (name, lastname, email, password, description) VALUES (?,?,?,?,?)";
                let values = [name.trim(), lastname.trim(), email.trim(), hashedPassword,description.trim()]

                if(req.file !=undefined){
                sql = 'INSERT INTO user (name, lastname, email, password, description,picture) VALUES (?,?,?,?,?,?)'
                values.push(req.file.filename)
            }
                
                connection.query(sql, values, (err, result) => {
                    if (err) {    
                        if(err.errno == 1062){
                            res.render('register', {message:"Email duplicado"})
                        }else{
                            throw err;
                        }            
                    } else {
                        res.redirect("/");
                    }
                });
            }
        });
    }
  };
}
    






module.exports = new IndexController;