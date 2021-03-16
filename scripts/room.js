let x = 100000000000000000000000000000000000000000000000000000000000
	window.scrollBy(10000000000000000, 10000000000000000)
$(document).ready(()=>{
	window.scrollBy(10000000000000000, 10000000000000000)
})
let load = ()=>{setTimeout(()=>{document.querySelector(".allMessages").lastChild.scrollIntoView()}, 1)}

let saveId = ()=>{
	let req = new XMLHttpRequest()
	req.open("POST", '/saveId', false)
	req.setRequestHeader("login", encode(Me.login))
	req.setRequestHeader("id", Me.id)
	req.send()
}

let getOther = ()=>{
	let req = new XMLHttpRequest()
	req.open("GET", '/getOther', false)
	req.setRequestHeader("login", encode($("title").html()))
	req.send()

	let res = JSON.parse(req.responseText)
	$(".otherAva").attr('src', res.photo);
	$(".otherName").html(res.login)
	if(res.online === 'on'){
		$(".otherOnline").html("Online")
		$(".otherOnline").css({
			'color': '#CEE4FD'
		})
	}
	else{
		$(".otherOnline").html("Offline")
		$(".otherOnline").css({
			'color': 'gray'
		})
	}
}
getOther()

let getRoom = ()=>{
	let req = new XMLHttpRequest()
	req.open("GET", '/getAllMessages', false)
	req.setRequestHeader("login", encode(Me.login))
	req.setRequestHeader("other", encode($(".otherName").html()))
	req.send()

	let res = JSON.parse(req.responseText)
	console.log(res)
	if(req.responseText != '[]'){
	let day = 0;
	let month = 0;
	let year = 0;
	res.forEach(elem=>{
		if(elem.login === Me.login){
			if(elem.day > day || elem.month.number > month){
				if(elem.year > year){
					$(`<div class="otherDay">${elem.month.name} ${elem.day} ${elem.year}</div>`).appendTo(".allMessages")
				}
				else{
					$(`<div class="otherDay">${elem.month.name} ${elem.day}</div>`).appendTo(".allMessages")
				}
			}
			$(`<div class="myMessage">
			<div class="messageText">${elem.text}</div>
			<div class="messageDate">${elem.time}</div>
		    </div>`).appendTo(".allMessages")

		}
		else{
			if(elem.day > day || elem.month.number > month){
				if(elem.year > year){
					$(`<div class="otherDay">${elem.month.name} ${elem.day} ${elem.year}</div>`).appendTo(".allMessages")
				}
				else{
					$(`<div class="otherDay">${elem.month.name} ${elem.day}</div>`).appendTo(".allMessages")
				}
			}
			$(`<div class="otherMessage">
			<div class="messageText">${elem.text}</div>
			<div class="messageDate">${elem.time}</div>
		</div>`).appendTo(".allMessages");
		}
		day = elem.day
		month = elem.month.number
		year = elem.year
	})
    }
    $(".allMessages").height($(".allMessages").height() + 'px')
	load()
}
getRoom()
load()

document.querySelector(".writeInp").addEventListener("input", ()=>{
	if($('.writeInp').val().replace(/\s+/g, ' ').trim() === ''){
		$(".writeAddImage").css({
			'right': '30px'
		})
		$(".writeSend").css({
			'right': '-350px'
		})
	}
	else{
		$(".writeSend").css({
			'right': '30px'
		})
		$(".writeAddImage").css({
			'right': '-350px'
		})
	}
})

class Socket{
	constructor(type, socket){
		this.type = type;//message / online / id
		this.socket = socket;// inside
	}
}

class Message{
	constructor(type, text){
		this.type = type;
		this.login = Me.login;
		this.text = text;
		this.time = now.time;//like 11:08
		this.year = now.year;//like 2021
		this.month = now.month;//[name, number]
		this.day = now.day;
	}
}

var socket = io(); 
socket.connect('http://127.0.0.1:3000'); 

socket.on('connect',function() {
    console.log('Client has connected to the server!');
});
socket.on('message', (text)=>{
	let data = JSON.parse(text)
	console.log(data)
	if(data.type === 'id'){
		Me.id = data.socket
		console.log(Me)
		saveId()
	}
})

socket.on('message', (text)=>{
	let data = JSON.parse(text)
	console.log(data)
	if(data.type === 'id'){
		Me.id = data.socket
		console.log(Me)
		saveId()
	}
	else if(data.type == 'message'){
	    if(data.login === $('.otherName').html()){
		    $(`<div class="otherMessage">
		    	<div class="messageText">${data.text}</div>
		    	<div class="messageDate">${data.time}</div>
		    </div>`).appendTo(".allMessages");
		    load()
	    }
	}
})
let send = (type, data)=>{
	Now()
	let message = new Message(type, data)
	socket.send(JSON.stringify(message))
}

$(".writeSend").click((e)=>{
	    Now()
	    let message = new Message('message', $('.writeInp').val())
	    message.roomId1 = Me.login + $(".otherName").html()
	    message.roomId2 = $(".otherName").html() + Me.login
	    message.other = $(".otherName").html()
	    socket.send(JSON.stringify(message))

	$(`<div class="myMessage">
			<div class="messageText">${$(".writeInp").val()}</div>
			<div class="messageDate">${now.time}</div>
		</div>`).appendTo(".allMessages")

	load()
	$(".writeInp").val('')
	$(".writeAddImage").css({
		'right': '30px'
	})
	$(".writeSend").css({
		'right': '-350px'
	})
})
document.addEventListener('keydown', (e)=>{
	if(e.code === 'Enter' && $('.writeInp').val().replace(/\s+/g, ' ').trim() != ''){
		Now()
	    let message = new Message('message', $('.writeInp').val())
	    message.roomId1 = Me.login + $(".otherName").html()
	    message.roomId2 = $(".otherName").html() + Me.login
	    message.other = $(".otherName").html()
	    socket.send(JSON.stringify(message))

	    $(`<div class="myMessage">
			<div class="messageText">${$(".writeInp").val()}</div>
			<div class="messageDate">${now.time}</div>
		</div>`).appendTo(".allMessages")

	    load()
	    $(".writeInp").val('')
	    $(".writeAddImage").css({
			'right': '30px'
		})
		$(".writeSend").css({
			'right': '-350px'
		})
	}
})
