<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<%@ page contentType="text/html; charset=UTF-8" %>
<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title>Session Expired</title>
	<style type="text/css">
		body {
			font-family: sans-serif;
			color: black;
			background: white;
		}
		h2 {
			color: #C80028;
		}
	</style>
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"/>
</head>
<body>
	<h2>Session Expired</h2>
	<p>
		The request cannot be completed correctly because it references
		an invalid or expired session. This happens when the browser
		is left idle for too long or when the server application is restarted.
	</p>
	<p>
		<a href="${fallbackContextUrl}${fallbackHomePath}">Back to Home</a>
	</p>
</body>
</html>