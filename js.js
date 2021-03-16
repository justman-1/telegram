let express = require("express")
let app = express()
//color: #398FD0
let PORT = process.env.PORT || 80
let server = require("http").createServer(app).listen(PORT)

let hash = function(str){
  return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}
let decode = (text)=>{
	return decodeURIComponent(text)
}

let fs = require("fs")

let bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

let multer  = require("multer")
const fileFilter = (req, file, cb) => {
  
    if(file.mimetype === "image/png" || 
    file.mimetype === "image/jpg"|| 
    file.mimetype === "image/jpeg"){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}
 
app.use(multer({dest:"photoes",fileFilter: fileFilter}).single("image"))

app.use(express.static('scripts'))
app.use(express.static('styles'))
app.use(express.static(__dirname))
app.use(express.static('imgs'))
app.use(function (err, req, res, next) {
  console.log('This is the invalid field ->', err.field)
  next(err)
})
app.set('view engine', 'ejs')


let mongoose = require('mongoose')
const Schema = mongoose.Schema

let mongo = require('./mongo')
let connectToMongoDb = async () => {
	await mongo().then(MongoClient => {
		try{
			console.log('Connected to mongoDB!')
		} finally{
			console.log("ok")
		}
	})
}
connectToMongoDb()

let userScheme = new Schema({
	login: String,
	password: Number,// with hesh
	photo: String,
	description: String,
	online: String,// off / on
	id: String
})
let roomScheme = new Schema({
	id: Number,
	parts: Object,
	messages: Object,
})

let User = mongoose.model("User", userScheme)
let Room = mongoose.model("Room", roomScheme)

class Message{
	constructor(login, text, time, year, month, day){
		this.login = login;
		this.text = text;
		this.time = time;//like 11:08
		this.year = year;//like 2021
		this.month = month;//[name, number]
		this.day = day;
	}
}

class Key{
	constructor(id, login){
		this.id = id;// id of room
		this.login = login;// login of other participant of room
	}
}

class Socket{
	constructor(type, socket){
		this.type = type;//message / online / id
		this.socket = socket;// inside
	}
}

app.get("/", (req, res) =>{
	res.render('signup', {
		error: '',
		login: ''
	})
})

app.post("/signin", (req, res) =>{
	res.render('signin', {
		error: '',
		login: ''
	})
})

app.post("/in1", urlencodedParser, (req, res) => {
	let login = req.body.login
	let pass1 = req.body.password1
	let pass2 = req.body.password2
	console.log(hash(pass1))
	console.log(hash(pass2))
	let user = new User({
		login: login,
	    password: hash(pass1),
	    photo: 'none',
	    keys: [],
	    description: 'Your description',
	    online: "off",
	    id: 'none'
	})
	console.log(user)
	if(pass1 != pass2){
		res.render('signup', {
		    error: "passwords don't match",
		    login: login
	    }) 
	}
	else if(login.replace(/\s+/g, ' ').trim() == '' || pass1.replace(/\s+/g, ' ').trim() == '' || pass2.replace(/\s+/g, ' ').trim() == ''){
		res.render('signup', {
		    error: "not all fields are filled in",
		    login: login
	    }) 
	}
	else{
		User.find({}, (err, docs) =>{
			if(err){console.log(err)}
				console.log(docs)

			let x = 0
			docs.forEach((elem)=>{
				if(elem.login === login){
					x = 1
					res.render('signup', {
		                error: "this name is taken",
		                login: ''
	                })
				}
			})

			if(x === 0){
				user.save(function(err){console.log(err)})
		        res.render('in', {
			        login: login,
			        photo: 'none',
			        pass: pass1
		        })
			}
		})
	}
})

app.post('/in2', urlencodedParser, (req, res)=>{
	let login = req.body.login
	let pass = req.body.password
	console.log(login + ' ' + hash(pass))
	User.find({}, (err, docs)=>{
		console.log(docs)
		if(docs.length === 0){
			res.render('signin', {
		        error: "There aren't users with this login",
	        }) 
		}
		else{
			let x = 0
			docs.forEach((elem)=>{
				if(elem.login === login && elem.password === hash(pass)){
					x = 1
					res.render('in', {
			            login: login,
			            photo: elem.photo,
			            pass: pass
		            })
				}
				else if(elem.login === login && elem.password != hash(pass)){
					res.render('signin', {
		                error: "Password is wrong",
		                login: login
	                }) 
				}
			})
			if(x == 0){
				res.render('signin', {
		            error: "There aren't users with this login",
		            login: ''
	            }) 
			}
		}
	})
})

app.get("/getMyImage", (req, res)=>{
	let login = decode(req.headers['login'])
	User.findOne({login: login}, (err, docs)=>{
		res.send(docs.photo)
	})
})
app.post("/feed", urlencodedParser, (req, res) =>{
	let login = req.body.login
	let pass = hash(req.body.password)
	console.log(req.body)
	User.find({login: login}, (err, docs)=>{
		if(docs[0].password === pass){
			res.render('main', {
			    login: login,
			    password: req.body.password
		    })
		}
		else{
			res.render('signin', {
		        error: 'Error'
	        })
		}
	})
})

app.get("/getMe", (req, res)=>{
	let login = decode(req.headers['login'])
	let pass = decode(req.headers['password'])
	console.log(login)
	User.findOne({login: login}, (err, docs)=>{
		if(docs.password === hash(pass)){
			let user = {
			    login: docs.login,
	            photo: docs.photo,
	            keys: docs.keys,
	            description: docs.description,
	            online: "on",
	            password: pass,
	            id: docs.id
		    }
		    console.log(docs)
		    res.send(JSON.stringify(user))
		}
		else{
			res.render('signin', {
		        error: 'Error'
	        })
		}
	})
	User.updateOne({login: login},
	 {online: 'on'},
	  function(err){console.log(err)}
	)
})

app.get("/MyProfile", (req, res)=>{
	res.render('me', {})
})

app.get("/messages", (req, res)=>{
	res.render("main", {})
})
app.post("/changeName", (req, res)=>{
	let login = decode(req.headers['login'])
	let login2 = decode(req.headers['login2'])
	let x = 0
	console.log(login + ' ' + login2)
	User.find({}, (err, docs)=>{
		docs.forEach((elem)=>{
			console.log(elem)
			if(elem.login === login2){
				x = 1
				res.send(login)
			}
		})
	})
	setTimeout(()=>{
		if(x === 0){
	    User.updateOne(
	        {login: login},
	        {login: login2},
	        (err)=>{if(err){console.log(err)}}
	    )
	    res.send(login2)
        }
	}, 500)
})

app.post("/changeDesc", (req, res)=>{
	let desc = decode(req.headers['desc'])
	let login = decode(req.headers['login'])
	User.updateOne(
		{login: login},
	    {description: desc},
	    (err)=>{console.log(err)}
	)
	res.send()
})

app.post("/changeImage", urlencodedParser, (req, res, next)=>{
	let filedata = req.file;
	let login = req.body.login;
	let pass = req.body.password
	console.log("Name and pass:")
	console.log(login)
	console.log(pass)
	console.log(filedata.path);
    console.log(filedata);
    User.findOne({login: login}, (err, docs)=>{
    	console.log(docs)
    	if(docs.password === hash(pass)){
    		User.updateOne({login: login},
    	    {photo: filedata.path},
    	    (err, res)=>{console.log(err); console.log(res)}
    	    )
    		if(docs.photo != 'none'){
    			fs.unlinkSync(docs.photo)
    		}
    	}
    })
    if(!filedata)
        res.send("Ошибка при загрузке файла");
    else
        res.render('ImageIn');
})

app.post("/deleteImage", (req, res)=>{
	let login = decode(req.headers['login'])
	User.findOne({login: login}, (err, docs)=>{
		fs.unlinkSync(docs.photo)
	})
	User.updateOne(
	{login: login},
	{photo: 'none'},
	(err, docs)=>{
		console.log(err)
	}
	)
})

app.get('/Users', (req, res)=>{
	res.render('users')
})

app.get("/getAllUsers", (req, res)=>{
	User.find({}, (err, docs)=>{
		let users = []
		docs.forEach((elem)=>{
			users.push({
				login: elem.login,
				photo: elem.photo,
				online: elem.online
			})
		}) 
		res.send(JSON.stringify(users))
	})
})

app.post("/offline", (req, res)=>{
	let login = decode(req.headers['login'])
	console.log(login)
	User.updateOne(
		{login: login},
		{online: "off"},
		(err)=>{console.log(err)}
	)
})

app.get('/getOther', (req, res)=>{
	let login = decode(req.headers["login"])
	User.findOne({login: login}, (err, docs)=>{
		let user = {
			login: docs.login,
			online: docs.online,
			photo: docs.photo,
			description: docs.description
		}
		res.send(JSON.stringify(user))
	})
})

app.post("/writeToOther", urlencodedParser, (req, res)=>{
	let other = req.body.other
	User.findOne({login: other}, (err, docs)=>{
		res.render("room", {
			login: other,
		})
	})
})

app.get("/getAllMessages", (req, res)=>{
	let login = decode(req.headers['login'])
	let other = decode(req.headers['other'])
	let id1 = hash(login + other)
	let id2 = hash(other + login)

	Room.find({}, (err, docs)=>{
		let x = 0
		docs.forEach((elem)=>{
			console.log(elem.parts[0] + ' ' + elem.parts[1] + ' ' + login + ' ' + other + ' ')
			if(elem.parts[0] === login && elem.parts[1] === other || elem.parts[1] === login && elem.parts[0] === other){
				res.send(elem.messages)
				x = 1
			}
		})
		if(x === 0){
			res.send(JSON.stringify([]))
		}
	})
})




const io = require('socket.io')(server);
io.sockets.on('connection', (socket) => {
	console.log(socket.id)
	let id = new Socket('id', socket.id)
	socket.send(JSON.stringify(id))
	socket.on("disconnect", ()=>{
		console.log('disconnect.')
		console.log(socket.id)
		console.log(typeof(socket.id))
		User.updateOne({id: socket.id}, {online: 'off', id: 'none'}, (err)=>{if(err){console.log(err)}})
		User.findOne({}, (err, docs)=>{console.log(docs)})
	})
	socket.on('message', (text)=>{
		let data = JSON.parse(text)
		let roomId1 = hash(data.roomId1)
		let roomId2 = hash(data.roomId2)
		let other = data.other
		console.log(data)
		Room.find({}, (err, docs)=>{
			let x = 0
			docs.forEach((elem)=>{
				if(elem.id === roomId1 || elem.id === roomId2){
					x = 1
					let message = new Message(data.login, data.text, data.time, data.year, data.month, data.day)
					let messages = elem.messages
					messages.push(message)
					Room.updateOne({id: elem.id}, {messages: messages}, (err)=>{if(err){console.log(err)}})
				}
			})
			if(x === 0){
				let room = new Room({
					id: roomId1,
					parts: [other, data.login],
					messages: [new Message(data.login, data.text, data.time, data.year, data.month, data.day)]
				})
				room.save((err)=>{console.log(err)})
			}
		})
		User.findOne({login: other}, (err, doc)=>{
			if(doc.id != 'none'){
				let id = doc.id
				socket.to(id).emit('message', text)
			}
		})
	})
});

app.post("/saveId", (req, res)=>{
	let login = decode(req.headers['login'])
	let id = req.headers['id']
	console.log(id + ' ' + login)
	User.updateOne({login: login}, {id: id}, (err, data)=>{console.log(data)})
	User.findOne({login: login}, (err, docs)=>{
		console.log(docs)
	})
	res.send()
})

app.get("/getRoomsAndUsers", (req, res)=>{
	let login = decode(req.headers['login'])
	let info = []// {user}
	Room.find({}, (err, docs)=>{
		docs.forEach(elem =>{
			if(elem.parts[0] === login){
				let other = elem.parts[1]
				User.findOne({login: other}, (err, result)=>{
					console.log(result)
					let user = {
						login: other,
						photo: result.photo,
						lastMessage: elem.messages[elem.messages.length - 1],
						id: elem.id
					}
					info.push(user)
				    console.log(user)
				    console.log(info)
				})
			}
			else if(elem.parts[1] === login){
				let other = elem.parts[0]
				User.findOne({login: other}, (err, result)=>{
					console.log(result)
					let user = {
						login: other,
						photo: result.photo,
						lastMessage: elem.messages[elem.messages.length - 1],
						id: elem.id
					}
					info.push(user)
				    console.log(user)
				    console.log(info)
				})
			}
		})
		 console.log(info)
		 setTimeout(()=>{res.send(JSON.stringify(info))}, 100)
	})
})

app.get("/openRoom", (req, res)=>{
	let id = req.headers['id']
	let login = decode(req.headers['login'])
	Room.findOne({id: id}, (err, docs)=>{
		User.findOne({login: login}, (err, docs2)=>{
			let user = {
				messages: docs.messages,
				login: login,
				online: docs2.online,
				photo: docs2.photo,
				parts: docs.parts
			}
			res.send(JSON.stringify(user))
		})
	})
})

app.post('/preSendPhoto', urlencodedParser, (req, res)=>{
	let photo = req.file.path
	let login = req.body.login
	let other = req.body.other
	console.log(1111111111111111111111)
	let date = JSON.parse(req.body.date1)
	let message = new Message('image' + login, photo, date.time, date.year, date.month, date.day)
	Room.find({}, (err, docs)=>{
		console.log(222222222222222)
		console.log(docs)
		docs.forEach(elem=>{
			console.log(33333333333333333)
			if(elem.parts[0] === other && elem.parts[1] === login || elem.parts[0] === login && elem.parts[1] === other){
				let id = elem.id
				console.log(elem)
				console.log(4444444444444)
				let messages = elem.messages
				messages.push(message)
				Room.updateOne({id: id}, {messages: messages}, (err)=>{if(err){console.log(err)}})
			}
		})
	})
})

app.get("/getPrePhoto", (req, res)=>{
	let login = decode(req.headers['login'])
	let other = decode(req.headers['other'])
	Room.find({}, (err, docs)=>{
		console.log(docs)
		let x = 0
		let id1 = hash(login + other)
		let id2 = hash(other + login)
		docs.forEach(elem=>{
			if(elem.id === id1 || elem.id === id2){
				
				elem.messages.forEach(message=>{
					if(message.login === 'image' + login){
						x = 2
						res.send(message.text)
					}
				})
			}
		})
		setTimeout(()=>{
		if(x =! 2){
			res.send("user.png")
		}
	}, 2000)
	})
})