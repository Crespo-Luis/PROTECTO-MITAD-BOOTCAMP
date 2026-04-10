const bcrypt = require("bcrypt");

const connection = require("../config/db");

class ArtistController {
  showRegister = (req, res) => {
    // res.render("register", { message:"" });

    res.render("register");
  };

  register = (req, res) => {
    const { name, lastname, email, password } = req.body;

    //validación de que todos los campos estén rellenos
    if(!name || !lastname || !email || !password){
        res.render('register', {message: "Debes cumplimentar todos los campos"})
    }else{
        //encriptar la password
        bcrypt.hash(password.trim(), 10, (errHash, hashedPassword) => {
            if (errHash) {
                throw errHash;
            } else {
                let sql =
                "INSERT INTO artist (name, lastname, email, password) VALUES (?,?,?,?)";
                let values = [name.trim(), lastname.trim(), email.trim(), hashedPassword];
                
                connection.query(sql, values, (err, result) => {
                    if (err) {
                        //si el email ya existe en la db lanza este error de duplicidad
                        if(err.errno == 1062){
                            res.render('register', {message:"Email duplicado"})
                        }else{
                            throw err;
                        }            
                    } else {
                        res.redirect("/artist/login");
                    }
                });
            }
        });
    }
  };

  showLogin = (req, res) => {
    res.render("login");
  };

  login = (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    //validaciones
    if(!email || !password){
        res.render('login', {message: "Debas cumplimentar todos los campos"})
    }else{
        //1º ver si el email del artista existe
        let sql = 'SELECT * FROM artist WHERE email = ? AND artist_is_deleted = 0';
        connection.query(sql, [email], (err, result)=>{
            if(err){
                throw err;
            }else{
                if(!result.length){
                    res.render('login', {message:"Credenciales incorrectas"})
                }else{
                    //ver si la contraseña es la adecuada para ese artista
                    //comprobar que la contraseña que viene con el formulario 
                    // equivale a la que está en la base de datos
                    let hashedPass = result[0].password;
                    bcrypt.compare(password, hashedPass, (errCompare, resultCompare)=>{
                        if(errCompare){
                            throw errCompare
                        }else{
                            if(resultCompare===true){
                                res.redirect(`/artist/profile/${result[0].artist_id}`)                    
                            }else{
                                res.render("login", {message: "Credenciales incorrectas"})
                            }
                        }
                    })
                }
            }
        })
    }

  }

  allArtist = (req, res) => {
    let sql = 'SELECT * FROM artist WHERE artist_is_deleted = 0'
    connection.query(sql, (err, result)=>{
        if(err){
            throw err;
        }else{            
            res.render("allArtists", {artists: result});
        }
    })
  };

  //método fácil
  profile = (req, res) => {
    const { id } = req.params;
    let sql = 'SELECT * FROM artist WHERE artist_id = ? AND artist_is_deleted = 0';
    let sqlArtworks = 'SELECT * FROM artwork WHERE artist_id = ? AND artwork_is_deleted = 0'

    connection.query(sql, [id], (err, result)=>{
        if(err){
            throw err
        }else{     
            connection.query(sqlArtworks, [id], (err2, resultArtworks)=>{
                if(err2){
                    throw err2
                }else{
                    console.log(resultArtworks);
                    
                    res.render('profile', {artista:result[0], resultArtworks});
                }
            })
        }
    })
}

//dificil
profileDificil = (req, res)=>{
    const { id } = req.params;
    console.log(id);
    
    let sql = `
    SELECT 
    a.*, aw.title, 
    aw.description, 
    aw.artwork_id, 
    aw.artwork_img, 
    aw.price, 
    aw.artist_id AS aw_artist_id
    FROM artist a LEFT JOIN artwork aw
    ON a.artist_id = aw.artist_id
    AND aw.artwork_is_deleted = 0
    WHERE a.artist_is_deleted = 0
    AND a.artist_id = ?
    `
    connection.query(sql, [id], (err, result)=>{
        if(err){
            throw err;
        }else{
            let artista = {
                artist_id: result[0].artist_id,
                name: result[0].name,
                lastname: result[0].lastname,
                email: result[0].email,
                avatar: result[0].avatar   
            }

            let artworks = [];
            let artwork = {};

            result.forEach(elem =>{
                if(elem.artwork_id){
                    artwork = {
                        artist_id: elem.aw_artist_id,
                        artwork_id: elem.artwork_id,
                        title: elem.title,
                        description: elem.description,
                        price: elem.price,
                        artwork_img: elem.artwork_img
                    }
                    artworks.push(artwork)
                }
            })          

            res.render('profile', {artista, resultArtworks: artworks});
        }
    })
  }


  showEditArtist = (req, res) =>{
    const {id} = req. params;
    let sql = 'SELECT * FROM artist WHERE artist_id = ? AND artist_is_deleted = 0'
    connection.query(sql, [id], (err, result)=>{
        if(err){
            throw err
        }else{
            res.render('formEditArtist', {artistToEdit: result[0]})
        }
    })
  }

  editArtist = (req, res) => {
    const {name, lastname} = req.body;
    const {id} = req.params;

    if(!name || !lastname) {
        let sql1 = 'SELECT * FROM artist WHERE artist_id = ? AND artist_is_deleted = 0'
        connection.query(sql1, [id], (err1, result1)=>{
        if(err1){
            throw err1
        }else{
            res.render('formEditArtist', {artistToEdit: result1[0], message:"Debes cumplimentar todos los campos"})
        }
        })
    }else{
        let sql2 = 'UPDATE artist SET name=?, lastname=? WHERE artist_id = ?';
        let values = [name, lastname, id]
        if(req.file){
            sql2 = 'UPDATE artist SET name=?, lastname=?, avatar=? WHERE artist_id = ?';
            values = [name, lastname, req.file.filename, id]
        }
        connection.query(sql2, values, (err2, result2)=>{
            if(err2){
                throw err2
            }else{
                res.redirect(`/artist/profile/${id}`)
            }
        })
    }
}

delDef = (req, res) =>{
    const {artist_id} = req.params;
    let sql = 'delete from artist where artist_id = ?'
    connection.query(sql, [artist_id], (err, result)=>{
        if(err){
            throw err
        }else{
            res.redirect('/allArtist');
        }
    })
}

delLog = (req, res) =>{
    const {artist_id} = req.params;
    let sql = `UPDATE artist a LEFT JOIN artwork aw 
               ON a.artist_id = aw.artist_id
               SET 
               a.artist_is_deleted = 1,
               aw.artwork_is_deleted =1
               WHERE
               a.artist_id = ?
    `
    connection.query(sql, [artist_id], (err, result)=>{
        if(err){
            throw err;
        }else{
            res.redirect('/artist/allArtist')
        }
    })
    
  }
}

module.exports = new ArtistController();
