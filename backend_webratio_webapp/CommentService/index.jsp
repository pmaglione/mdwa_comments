

  
    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="webratio" uri="http://www.webratio.com/2006/TagLib/JSP20" %>
    <c:set var="url"><webratio:Link link="page3.link"/></c:set>
    <%response.sendRedirect((String) pageContext.getAttribute("url"));%>
    
  