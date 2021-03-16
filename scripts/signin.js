document.querySelector('.login').addEventListener("input", ()=>{
	if($(".login").val().length > 25){
		$(".login").val($(".login").val().substr(0, 25))
	}
})

