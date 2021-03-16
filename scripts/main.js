let getRooms = ()=>{
	let req = new XMLHttpRequest()
	req.open("GET", '/getRoomsAndUsers', false)
	req.setRequestHeader("login", encode(Me.login))
	req.send()

	let res = JSON.parse(req.responseText)

	res.forEach(elem=>{
		let photo = '/user.png'
		if(elem.photo != 'none'){
			photo = elem.photo
		}
		let last = elem.lastMessage.text
		if(elem.lastMessage.text.length > 30){
			last = elem.lastMessage.text.substr(0, 30) + '...'
		}
		$(`<div class="room">
    		<img class="roomAva" src="${photo}">
    		<div class="loginAndMess">
    			<div class="otherLogin">${elem.login}</div>
    			<div class="otherMess">${last}</div>
    		</div>
    		<div class="roomId" >${elem.id}</div>
    	</div>`).appendTo(".allRooms")
	})
}
getRooms()
let load = ()=>{setTimeout(()=>{document.querySelector(".allMessages2").lastChild.scrollIntoView()}, 1)}

let openRoom = (id, login)=>{
	let req = new XMLHttpRequest()
	req.open("GET", '/openRoom', false)
	req.setRequestHeader("id", id)
	req.setRequestHeader("login", encode(login))
	req.send()

	let res = JSON.parse(req.responseText)
	let online = 'Online'
	let color = 'white'
	if(res.online != 'on'){
		online = 'Offline'
		color = 'gray'
	}
	console.log(res)
	let photo = '/user.png'
	if(res.photo != 'none'){
		photo = res.photo
	}
	$(".otherName").html(login)
	$(".otherOnline").html(online).css({'color': color})
	$(".otherAva").attr('src', '/' + photo)
	$(".allMessages2").remove()
	$(`<div class="allMessages2"></div>`).appendTo(".allMessages")
	let day = 0;
	let month = 0;
	let year = 0;
	res.messages.forEach(elem=>{
		if(elem.login === Me.login){
			if(elem.day > day || elem.month.number > month){
				if(elem.year > year){
					$(`<div class="otherDay">${elem.month.name} ${elem.day} ${elem.year}</div>`).appendTo(".allMessages2")
				}
				else{
					$(`<div class="otherDay">${elem.month.name} ${elem.day}</div>`).appendTo(".allMessages2")
				}
			}
			$(`<div class="myMessage">
			<div class="messageText">${elem.text}</div>
			<div class="messageDate">${elem.time}</div>
		    </div>`).appendTo(".allMessages2")

		}
		else if (elem.login === login){
			if(elem.day > day || elem.month.number > month){
				if(elem.year > year){
					$(`<div class="otherDay">${elem.month.name} ${elem.day} ${elem.year}</div>`).appendTo(".allMessages2")
				}
				else{
					$(`<div class="otherDay">${elem.month.name} ${elem.day}</div>`).appendTo(".allMessages2")
				}
			}
			$(`<div class="otherMessage">
			<div class="messageText">${elem.text}</div>
			<div class="messageDate">${elem.time}</div>
		</div>`).appendTo(".allMessages2");
		}
		day = elem.day
		month = elem.month.number
		year = elem.year
	})
	$(".roomSect").css({
		'left': '0px'
	})
	$(".write").css({
		'left': '0px'
	})
	$(".roomHeader").css({
		'left': '0px'
	})
	load()
}

let saveId = ()=>{
	let req = new XMLHttpRequest()
	req.open("POST", '/saveId', false)
	req.setRequestHeader("login", encode(Me.login))
	req.setRequestHeader("id", Me.id)
	req.send()
} 

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
$(document).click(e=>{
	if(e.target.className === 'otherLogin' || e.target.className === 'otherMess'){
		let id = e.target.parentNode.parentNode.children[2].innerHTML
		let login = e.target.parentNode.parentNode.children[1].children[0].innerHTML
		openRoom(id, login)

	}
	else if(e.target.className === 'loginAndMess' || e.target.className === 'roomAva'){
		let id = e.target.parentNode.children[2].innerHTML
		let login = e.target.parentNode.children[1].children[0].innerHTML
		openRoom(id, login)
	}
	else if(e.target.className === 'room'){
		let id = e.target.children[2].innerHTML
		let login = e.target.children[1].children[0].innerHTML
		openRoom(id, login)
	}
})

$(".cross2").click(()=>{
	$(".roomSect").css({
		'left': '101%'
	})
	$(".write").css({
		'left': '101%'
	})
	$(".roomHeader").css({
		'left': '101%'
	})
})

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

let findOtherLastAndChange = (login, text)=>{
	let elems = document.querySelector(".allRooms").children
    for(i=0;i<elems.length;i++){
	    if(elems[i].children[1].children[0].innerHTML === login){
		    elems[i].children[1].children[1].innerHTML = text
	    }
    }
}

var socket = io(); 
socket.connect('http://127.0.0.1:3000'); 

socket.on('message', (text)=>{
	let data = JSON.parse(text)
	if(data.type === 'id'){
		Me.id = data.socket
		saveId()
	}
	else if(data.type == 'message'){
		if(data.login === $('.otherName').html()){
			$(`<div class="otherMessage">
			<div class="messageText">${data.text}</div>
			<div class="messageDate">${data.time}</div>
		    </div>`).appendTo(".allMessages2");
		    load()
		}
		findOtherLastAndChange(data.login, data.text)
	}
})

document.addEventListener('keydown', (e)=>{
	if(e.code === 'Enter' && $('.writeInp').val().replace(/\s+/g, ' ').trim() != ''){
		Now()
	    let message = new Message('message', $('.writeInp').val())
	    message.roomId1 = Me.login + $(".otherName").html()
	    message.roomId2 = $(".otherName").html() + Me.login
	    message.other = $(".otherName").html()
	    console.log(message)
	    socket.send(JSON.stringify(message))
	    findOtherLastAndChange(message.other, message.text)

	    $(`<div class="myMessage">
			<div class="messageText">${$(".writeInp").val()}</div>
			<div class="messageDate">${now.time}</div>
		</div>`).appendTo(".allMessages2")

	    let x = 10000000000000
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

$(".writeSend").click(()=>{
	    Now()
	    let message = new Message('message', $('.writeInp').val())
	    message.roomId1 = Me.login + $(".otherName").html()
	    message.roomId2 = $(".otherName").html() + Me.login
	    message.other = $(".otherName").html()
	    console.log(message)
	    socket.send(JSON.stringify(message))

	$(`<div class="myMessage">
			<div class="messageText">${$(".writeInp").val()}</div>
			<div class="messageDate">${now.time}</div>
		</div>`).appendTo(".allMessages2")

	let x = 100000000000000000000
	load()
	$(".writeInp").val('')
	$(".writeAddImage").css({
		'right': '30px'
	})
	$(".writeSend").css({
		'right': '-350px'
	})
})

$(".photoFileSend").change(()=>{
	$(".photoMeLogin").val(Me.login)
	Now()
	$(".photoDate").val(JSON.stringify(now))
	$(".photoOther").val($(".otherName").html())

	formData = new FormData();
	alert( $(".photoFileSend").val())
	

	setTimeout(()=>{
		let req = new XMLHttpRequest()
		req.open("GET", '/getPrePhoto', false)
		req.setRequestHeader("login", encode(Me.login))
		req.setRequestHeader("other", encode($(".otherName").html()))
		req.send()
		let res = req.responseText
		alert(res)
		$(`<div class="preImageBl">
			<img src="${res}" class="preImage">
			<div class="preCrossBl">
				<img src="/cross.svg" class="preCross">
			</div>
		</div>`).appendTo('.prePhotoes')
		$(".prePhotoes").css({
			'bottom': '0px'
		})
		$(".write").css({
			'bottom': '200px'
		})
	}, 500)
})