$(".addImage2").css({
	'margin-top': $(".mePhBl2").css('width'),
	'left': +parseInt($(".mePhBl2").css('width')) - +250
})
$(".emit2").height($(".emit2").width())
$(".sendMyName").val(Me.login)

let getAllUsers	= ()=>{
	let req = new XMLHttpRequest()
	req.open("GET", '/getAllUsers', false)
	req.send()

	let res = JSON.parse(req.responseText)
	res.forEach((elem)=>{
		let online = 'offline'
		let color;
		let photo = elem.photo
		if(elem.online === 'on'){online = 'online'; color = '#398FD0'}
		if(elem.photo == 'none'){photo = '/user.png'}
		$(`<div class="user">
    		    <div style="width: 100px; height: 100px; float: left; margin: 25px; border-radius: 100px; overflow: hidden">
    		        <img class="userAva" src="${photo}">
    		    </div>
    		    <div style="float: left; margin-top: 25px">
    			    <span class="userLogin">${elem.login}</span><br>
    		        <span class="online" style="color: ${color}">${online}</span>
    		    </div>
    	</div>`).appendTo('.usersSect')
	})

}
getAllUsers()

$(".from3").click(()=>{
	$(".from3").trigger("submit")
})

let showOther = (login)=>{
	let req = new XMLHttpRequest()
	req.open("GET", '/getOther', false)
	req.setRequestHeader("login", encode(login))
	req.send()

	let res = JSON.parse(req.responseText)

	$(".Other").css({
		'right': '0px'
	})
	let photo = res.photo
	if(res.photo == 'none'){
		photo = '/user.png'
	}
	$(".mePhoto").attr('src', photo);
	$(".name222").val(res.login)
	$(".myName").html(res.login)
	if(res.online != 'on'){
		$(".myOnline").html("Offline")
		$(".myOnline").css({
			'color': 'gray'
		})
	}
	else if(res.online == 'on'){
		$(".myOnline").html("Online")
		$(".myOnline").css({
			'color': '#398FD0'
		})
	}
	if(res.login === Me.login){
		$(".sendImForm2").css({
			'display': 'none'
		})
	}
	else if(res.login != Me.login){
		$(".sendImForm2").css({
			'display': 'block'
		})
	}
	$(".description").html(res.description)
}


$(document).click((e)=>{
	if(e.target.className === 'userAva'){
		let login = e.target.parentNode.parentNode.children[1].children[0].innerHTML
		showOther(login)
		
	}
	else if(e.target.className === 'userLogin' || e.target.className === 'online'){
		let login = e.target.parentNode.parentNode.children[1].children[0].innerHTML
		showOther(login)
	}
	else if(e.target.className === 'user'){
		let login = e.target.children[1].children[0].innerHTML
		showOther(login)
	}
})

$(".arrow2").click(()=>{
	$(".Other").css({
		'right': '-101%'
	})
})


$(".seacrhImg").click(e=>{
	$(".searchUsers").css({
	    'width': '70%',
	    'opacity': '1'
    })
    $(".searchUsers").focus()
})
$(".searchUsers").on( "focusout", ()=>{
	if($(".searchUsers").val().replace(/\s+/g, ' ').trim() == ''){
		$(".searchUsers").css({
	        'width': '0%',
	        'opacity': '0'
        })
	}
})

document.querySelector(".searchUsers").addEventListener('input', ()=>{
	let all = document.querySelectorAll(".userLogin")
	let text = $(".searchUsers").val()
	if(text.toLowerCase() != ''){
		all.forEach(function(elem){
		    if(elem.innerText.toLowerCase().search(text.toLowerCase()) != -1){
			    $(elem.parentNode.parentNode).css({
			    	'display': 'block'
			    })
		    }
		    else{
		    	 $(elem.parentNode.parentNode).css({
			    	'display': 'none'
			    })
		    }
	    })
	}
	else{
		all.forEach(function(elem){
		 $(elem.parentNode.parentNode).css({
		 	'display': 'block'
		 })
	    })
	}
})

let saveId = ()=>{
	let req = new XMLHttpRequest()
	req.open("POST", '/saveId', false)
	req.setRequestHeader("login", encode(Me.login))
	req.setRequestHeader("id", Me.id)
	req.send()
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