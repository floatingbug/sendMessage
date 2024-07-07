function sendMessage({nodemailer}){
	return (req, res) => {
		handleRequest({req, res, nodemailer});
	}
}

async function handleRequest(params){
	const {req, res, nodemailer} = params;
	const token = req.body.token;
	
	//validate captcha-token
	const data = new URLSearchParams({
		secret: '6LcDywkqAAAAAJ33W3srzM4vZZBkNoPFPHAPd3u3',
		response: token,
		remoteip: req.ip
	});

	const options = {
		method: "POST",
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: data.toString()
	}

	let result = null;
	try{
		const response = await fetch("https://www.google.com/recaptcha/api/siteverify", options);
		result = await response.json();
	}
	catch(err){
		console.log(err);
	}

	console.log(result)

	if(!result.success){
		res.status(400);
		return res.json({success: false, msg: "Captcha failed. Please try again."});
	}

	//validate message
	if(!req.body || !req.body.subject || !req.body.mail || !req.body.msg){
		res.status(400);
		return res.json({success: false, msg: "subject, mail and msg is required."});
	}
	if(typeof req.body.subject !== "string" || typeof req.body.mail !== "string" || typeof req.body.msg !== "string"){
		res.status(400);
		return res.json({success: false, msg: "every parameter must be type string."});
	}

	if(!validateEmail(req.body.mail)){
		res.status(400);
		return res.json({success: false, msg: "No valid e-mail address."});
	}
	
	//prepare e-mail
	const message = {
		subject: req.body.subject,
		mail: req.body.mail,
		msg: req.body.msg
	};


	const transporter = nodemailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
	  	auth: {
			user: process.env.GMAIL_EMAIL,
			pass: process.env.GMAIL_PASSWORD
	  	}
	});

	// send mail with defined transport object
	try{
		const info = await transporter.sendMail({
			from: `<${message.mail}>`, // sender address
			to: process.env.GMAIL_EMAIL, // list of receivers
			subject: message.subject, // Subject line
			text: message.msg, // plain text body
		});
		
		console.log("Message sent: %s", info.messageId);
	}
	catch(err){
		console.log(err);
		res.status(500);
		res.json({success: false, msg: "Something went wrong. Please try again."});
	}

	res.status(200);
	res.json({success: true, msg: "Email has been sent."});
}

function validateEmail(email){
	const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
 	return re.test(email);
}


module.exports = {sendMessage};
