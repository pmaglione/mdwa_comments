<%@   taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"
%><%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"
%><%@ taglib prefix="webratio" uri="http://www.webratio.com/2006/TagLib/JSP20"
%><webratio:Response inlineTypes="text/html,text/xml,application/xml"/><?xml version="1.0" encoding="UTF-8"?>

	<%@ page contentType="text/xml; charset=UTF-8"%>


<Response>
	<c:forEach var="win" items="${closedWindows}">
		<CloseWindow name="${win.name}"/>
	</c:forEach>
	<c:if test="${empty contentLocation}">
		<c:forEach var="win" items="${openedWindows}">
			<OpenWindow name="${win.name}">
				<UIConfig>
					{
						"${win.name}": {
							"factory": "window",
							"viewer": "wr.ui.jquery.DialogViewer",
							"views": {
								"${win.name}_page": {
									"viewer": "wr.ui.html.ContainerElementViewer",
									"viewerConfig": { "containersFilter": ".wr-ajaxDiv" }
								}
							}
						}
					}
				</UIConfig>
				<Params <c:forEach var="p" items="${win.params}">${p.key}="<c:out value="${p.value}"/>" </c:forEach>/>
			</OpenWindow>
		</c:forEach>
	</c:if>
	<c:choose>
		<c:when test="${not(empty contentLocation)}">
			<Content location="<c:out value="${contentLocation}"/>"/>
		</c:when>
		<c:otherwise>
			<Content window="${updatedWindowName}" type="${contentType}">
				<c:choose>
					<c:when test="${contentType eq 'text/xml' or contentType eq 'application/xml'}">
						<c:out value="${contentString}" escapeXml="false"/>
					</c:when>
					<c:otherwise>
						<![CDATA[<c:out value="${contentString}" escapeXml="false"/>]]>
					</c:otherwise>
				</c:choose>
			</Content>
		</c:otherwise>
	</c:choose>
</Response>