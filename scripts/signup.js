document.querySelector('.login').addEventListener("input", ()=>{
	if($(".login").val().length > 25){
		$(".login").val($(".login").val().substr(0, 25))
	}
})
document.querySelector('.pass2').addEventListener("input", ()=>{
	if($(".pass1").val() != $(".pass2").val()){
		$(".error").html("translations don't match")
	}
	else{
		$(".error").html("")
	}
})
document.querySelector('.pass1').addEventListener("input", ()=>{
	if($(".pass1").val() != $(".pass2").val()){
		$(".error").html("translations don't match")
	}
	else{
		$(".error").html("")
	}
})
