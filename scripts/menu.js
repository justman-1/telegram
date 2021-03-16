$(".settingsIm").click(()=>{
	$(".nav").css({
		'left': '0%',
	})
	$(".exit").css({
		'left': '30px'
	})
})
$(".cross").click(()=>{
	$(".nav").css({
		'left': '-81%',
	})
	$(".exit").css({
		'left': '-200px'
	})
})
let date = new Date()
let Me;
let now = {
 time: date.getHours() + ':' + date.getMinutes() ,
 year: date.getFullYear(),
 month: {
 	number: date.getMonth(),
 	name: 'name'
 },
 day: date.getDate()
}
let Now = ()=>{
	date = new Date()
	now = {
    	time: date.getHours() + ':' + date.getMinutes() ,
    	year: date.getFullYear(),
    	month: {
    		number: date.getMonth(),
    		name: 'name'
    	},
    	day: date.getDate()
    }
    if(+date.getMinutes() - +10 < 0){
    	now.time == date.getHours() + ':0' + date.getMinutes()
    }
    if(+date.getHours() - +10 < 0){
    	now.time == '0' + date.getHours() + ':' + date.getMinutes()
    }
    if(now.month.number == 1){now.month.name = 'January'};
    if(now.month.number == 2){now.month.name = 'February'};
    if(now.month.number == 3){now.month.name = 'March'};
    if(now.month.number == 4){now.month.name = 'April'};
    if(now.month.number == 5){now.month.name = 'May'};
    if(now.month.number == 6){now.month.name = 'June'};
    if(now.month.number == 7){now.month.name = 'July'};
    if(now.month.number == 8){now.month.name = 'August'};
    if(now.month.number == 9){now.month.name = 'September'};
    if(now.month.number == 10){now.month.name = 'October'};
    if(now.month.number == 11){now.month.name = 'November'};
    if(now.month.number == 12){now.month.name = 'December'};
}

let getMe = ()=>{
	let login = JSON.parse(localStorage.getItem('user')).login
	let req = new XMLHttpRequest()
	req.open("GET", '/getMe', false)
	req.setRequestHeader('login', encodeURIComponent(login))
	req.setRequestHeader('password', encodeURIComponent(JSON.parse(localStorage.getItem('user')).password))
	req.send()

	Me = JSON.parse(req.responseText)
	if(Me.photo != 'none'){
		$(".accAva").attr('src', '/' + Me.photo);
	}
	$(".accLoginSp").html(Me.login)
}
$("a").click(()=>{
	localStorage.setItem('user', JSON.stringify({login: Me.login, password: Me.password}));
})
getMe()

$(document).unload(()=>{
	alert("as")
})

let encode = (text)=>{
	return encodeURIComponent(text)
}