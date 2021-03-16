if(Me.photo != 'none'){
	$(".accAva").attr('src', '/' + Me.photo);
	$(".mePhoto").attr('src', '/' + Me.photo);
}
$(".myName").html(Me.login)
$(".description").html(Me.description)
$(".name111").val(Me.login)
$(".pass111").val(Me.password)
$(".name222").val(Me.login)
$(".pass222").val(Me.password)
$(".editNameInp").val(Me.login)
$(".editDescInp").val(Me.description)
$(".mePhBl2").height($(".mePhBl2").css('width'))
$(".emit2").height($(".mePhBl2").height())
$(".addImage").css({
	'margin-top': +$(".mePhBl2").height() - +100,
	"margin-left": +$(".mePhBl2").height() - +250,
})
$(".pointsIm").click(()=>{
	$(".settingsP").css({
		'top': '30px'
	})
})
$(".arrow1").click(()=>{
	$(".settingsP").css({
		'top': '-550px'
	})
})
$(".editName").click(()=>{

})
document.querySelector('.editNameInp').addEventListener("input", ()=>{
	if($(".editNameInp").val().length > 25){
		$(".editNameInp").val($(".editNameInp").val().substr(0, 25))
	}
})
$(".editName").click(()=>{
	$(".editNameSect").css({
		'right': '0px'
	})
	$(".settingsP").css({
		'top': '-550px'
	})
})
$(".myName").click(()=>{
	$(".editNameSect").css({
		'right': '0px'
	})
	$(".settingsP").css({
		'top': '-550px'
	})
})
$(".arrow2").click(()=>{
	$(".editNameSect").css({
		'right': '-105%'
	})
	setTimeout(()=>{
		$(".editNameInp").val(Me.login)
	}, 400)
})
$(".bird1").click(()=>{
	if($(".editNameInp").val() === Me.login){
		$(".editNameSect").css({
		    'right': '-105%'
	    })
	}
	else{
		let req = new XMLHttpRequest()
		req.open("POST", '/changeName', false)
		req.setRequestHeader("login", encode(Me.login))
		req.setRequestHeader("login2", encode($(".editNameInp").val()))
		req.send()
		if(req.responseText === Me.login){
			alert("This login is taken.")
		}
		else{
			$(".editNameSect").css({
		        'right': '-105%'
	        })
	        localStorage.setItem('user', JSON.stringify({login: $(".editNameInp").val(), password: Me.password}));
	        $(".myName").html($(".editNameInp").val())
	        $(".accLoginSp").html($(".editNameInp").val())
	        Me.login = JSON.parse(localStorage.getItem("user")).login
		}

	}
})



$(document).click((e)=>{
	if(e.target.className === 'des' || e.target.className === 'setDesc settPart' || e.target.className === 'description'){
		$(".editDescSect").css({
		    'right': '0px'
	    })
	    $(".settingsP").css({
		    'top': '-550px'
	    })

	}
	else if(e.target.className === 'arrow3'){
		$(".editDescSect").css({
		    'right': '-105%'
	    })
	    setTimeout(()=>{
		    $(".editDescInp").val(Me.description)
	    }, 400)
	}
	else if(e.target.className === 'bird2'){
		if($(".editDescInp").val() === Me.description){
			$(".editDescSect").css({
		        'right': '-105%'
	        })
		}
		else{
			$(".editDescSect").css({
		        'right': '-105%'
	        })
	        let req = new XMLHttpRequest()
		    req.open("POST", '/changeDesc', false)
		    req.setRequestHeader("login", encode(Me.login))
		    req.setRequestHeader("desc", encode($(".editDescInp").val()))
		    req.send()
		    Me.description = $(".editDescInp").val()
		    $(".description").html(Me.description)
		}
	}
})

$(".imageSend").change(()=>{
	$(".sendImForm").trigger("submit")
})
$(".imageSend2").change(()=>{
	$(".sendImForm2").trigger("submit")
})
$(".delPhoto").click(()=>{
	let req = new XMLHttpRequest()
	req.open("POST", '/deleteImage')
	req.setRequestHeader("login", encode(Me.login))
	req.send()
	Me.photo = 'none'
	$(".settingsP").css({
		'top': '-550px'
	})
	$(".accAva").attr('src', "/user.png");
	$(".mePhoto").attr('src', "/user.png");
})

var socket = io(); 
socket.connect('http://127.0.0.1:3000'); 

socket.on('connect',function() {
    console.log('Client has connected to the server!');
});

let saveId = ()=>{
	let req = new XMLHttpRequest()
	req.open("POST", '/saveId', false)
	req.setRequestHeader("login", encode(Me.login))
	req.setRequestHeader("id", Me.id)
	req.send()
} 
socket.on('message', (text)=>{
	let data = JSON.parse(text)
	console.log(data)
	if(data.type === 'id'){
		Me.id = data.socket
		console.log(Me)
		saveId()
	}
})