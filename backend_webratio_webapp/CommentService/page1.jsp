<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>
	<%@ taglib prefix="webratio" uri="http://www.webratio.com/2006/TagLib/JSP20" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page contentType="text/html; charset=UTF-8"%> 
<webratio:Page page="page1"/>
<html>
<head>
  <link href="Resources/favicon.png" rel="shortcut icon"/>
  <base href="<%=wrBaseURI%>"/> 
  <title>Comments List</title>
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <c:set var="wrAjaxDebugLevel" value="minimal"/>
	<script src="<webratio:Resource path="WRResources/ajax/jquery/jquery.min.js"/>" type="text/javascript"></script><!--[data] {"wr-resname": "jquery", "wr-resver": "1.12.4"}-->
	<script src="<webratio:Resource path="WRResources/script.js"/>" type="text/javascript"></script><!--[data] {"wr-resname": "wr-utils-supportscripts", "wr-resver": "7.2.18"}-->
			<c:if test="${(wrBoxed or wrAjaxCalling)}">
	<link href="<webratio:Resource path="WRResources/ajax/jquery-ui/themes/smoothness/jquery-ui.min.css"/>" type="text/css" rel="stylesheet"></link><!--[data] {"wr-resname": "jquery-ui-style", "wr-resver": "1.9.2"}-->
			</c:if>
			<c:if test="${(wrBoxed or wrAjaxCalling)}">
	<script src="<webratio:Resource path="WRResources/ajax/jquery-ui/jquery-ui.min.js"/>" type="text/javascript"></script><!--[data] {"wr-resname": "jquery-ui", "wr-resver": "1.9.2"}-->
			</c:if>
			<c:if test="${(wrBoxed or wrAjaxCalling)}">
	<link href="<webratio:Resource path="WRResources/ajax/jquery-ui/themes/webratio/style.css"/>" type="text/css" rel="stylesheet"></link><!--[data] {"wr-resname": "wr-ui-style", "wr-resver": "7.2.18"}-->
			</c:if>
			<c:if test="${(wrBoxed or wrAjaxCalling) and not(empty webratio:expandLayoutResourceContent('BUILTIN/wr-runtime', 'WRResources/ajax/webratio/', pageContext))}">
	<script src="<webratio:Resource path="${webratio:expandLayoutResourceContent('BUILTIN/wr-runtime', 'WRResources/ajax/webratio/', pageContext)}"/>" type="text/javascript"></script><!--[data] {"wr-resname": "wr-runtime", "wr-resver": "7.2.18"}-->
<c:if test="${not wrAjax and not webratio:isWindow(pageContext)}">
	<script type="text/javascript">
		<c:choose>
			<c:when test="${wrBoxed}">
				(wr._configs = (wr._configs || {}))["${wrClientAppName}"] = (function() {
					var app = new wr.app.App("${wrClientAppName}");
					app.configure({
			</c:when>
			<c:otherwise>
				(function() { 
					wr.getApp().mergeConfig({
			</c:otherwise>
		</c:choose>
			log: {
				implementation: "wr.log.LogPlugin",
				appenders: [
					"wr.log.HtmlAppender"
				],
				categories: {
					<c:choose>
						<c:when test="${wrAjaxDebugLevel eq 'full'}">
							"": wr.log.Level.DEBUG
						</c:when>
						<c:otherwise>
							"": wr.log.Level.WARN,
							"wr.logic.AjaxRequestActor._response": wr.log.Level.DEBUG,
							"wr.ui.html.ElementViewer._code": wr.log.Level.DEBUG,
							"wr.widgets": wr.log.Level.DEBUG
						</c:otherwise>
					</c:choose>
				}
			},
		ui: {
			implementation: "wr.ui.UIPlugin",
			factories: {
				"display": "wr.ui.DisplayControlFactory",
				"window": "wr.ui.WindowControlFactory",
				"default": "wr.ui.ViewerBasedControlFactory"
			},
			display: { 
				factory: "display", 
				viewer: "wr.ui.web.BrowserViewer",
				views: {
					"${wrCurrentWindowName}": {
						factory: "window",
						viewer: "${wrBoxed ? 'wr.ui.web.BoxViewer' : 'wr.ui.web.WindowViewer'}",
						viewerConfig: { <c:if test="${wrBoxed}">boxSelector: "#wr-${wrClientAppName}"</c:if> },
						views: {
							"${wrCurrentWindowName}_page": {
								viewer: "wr.ui.html.ContainerElementViewer",
								viewerConfig: { containersFilter: ".wr-ajaxDiv" }
							}
						}
					}
				}
			}
		},
		nav: {
			implementation: "wr.nav.NavPlugin",
			routers: [ {
				name: "wr.nav.PropagationRouter",
				priority: -50
			}, {
				name: "wr.nav.HttpWebRouter",
				priority: -100
			} ]
		},
		logic: {
			implementation: "wr.logic.LogicPlugin"
		},
		oldajax: {
			implementation: "wr.LegacyAjaxPlugin",
				containersFilter: ".wr-ajaxDiv"
			}
		<c:choose>
			<c:when test="${wrBoxed}">
					}).chain(function() {
						app.init();
					}).chain(function() {
						app.start();
					});
				});
			</c:when>
			<c:otherwise>
					});
				})();
			</c:otherwise>
		</c:choose>
	</script>
</c:if>
			</c:if>
	<link href="<webratio:Resource path="wrdefault/css/default.css"/>" type="text/css" rel="stylesheet"></link><!--[data] {"wr-resname": "wrdefault-style"}-->
<script type="text/javascript">if (typeof wr !== "undefined") { wr.ui.html.resx.refreshLoaded(); }</script>
</head>
<body>
	<c:if test="${wrBoxed}">
		<div <c:if test="${not wrAjax}">id="wr-${wrClientAppName}" data-wr-appid="${wrClientAppName}"</c:if> class="wr-appui wr-appui-${wrClientAppName}">
	</c:if>
	<webratio:CollectScripts var="inlineScripts" enabled="${wrBoxed}" eventHandlerWrapper="wr.keepScoped">
			<html:form action="form_page1.do${wrAjax ? '#!ajax=true' : ''}" styleId="page1FormBean" enctype="multipart/form-data">
		<c:if test="${wrBoxed}">
			<script>
				jQuery("#page1FormBean").prop("action", "${wrBaseURI}form_page1.do${wrAjax ? '#!ajax=true' : ''}");
			</script>
		</c:if>
			<html:hidden property="CSRFToken"/>
			<html:hidden property="lastURL" styleId="lastURL_page1"/>
				<input type="hidden" name="ln9" value="<webratio:Link link="ln9"/>"/>
<table width="100%" style="align:right">
	<tr>
		<td width="100%"></td>
    	<td nowrap="nowrap"></td>
	</tr>
	<tr>
		<td width="100%"></td>
    		<td nowrap="nowrap">	
 <a class="" href="<webratio:Link link="page2.link"/>">
   Create Comment
</a>
 </td>
	</tr>
	<tr>
		<td width="100%"></td>
	</tr>
	<tr>
		<td width="100%"></td>
    	<td nowrap="nowrap"></td>
	</tr>
</table>
<table width="100%">
	<tr>
		<td align="center"><h1>Comments List</h1></td>
	</tr>
</table>
<table>
	<tr>
	</tr>
</table>
<table>
	<tr>
	</tr>
</table>
<br>
<table>
	<tr>
		<td>
			<span class="">
</span>
&gt;Comments List
		</td>
	</tr>
</table>
<table width="100%" valign="top">
	<tr>
		<td>
		</td>
		<td>
<c:if test="${not(empty inu1) and (inu1.dataSize gt 0)}">
		<div class="plain ">
			<div class="plain IndexUnit">
				<table border="0" cellspacing="1" cellpadding="2" id="inu1_0_sortable">
					<tr>
						<th class=" header"></th>
						<th nowrap="nowrap" class=" header">content</th>
					</tr>
				<c:forEach var="current" varStatus="status" items="${inu1.data}">
					<c:set var="index" value="${status.index}"/>	
						<tr class="row<c:if test="${inu1.currentIndex eq index}">Current</c:if>">	
								<td class=" value<c:if test="${inu1.currentIndex eq index}">Current</c:if>">
									<img src="WRResources/spacer.gif" class="bullet<c:if test="${inu1.currentIndex eq index}">Current</c:if>" border="0" alt=""/>
								</td>
									<!-- not linked attribute -->
									<td class=" value<c:if test="${inu1.currentIndex eq index}">Current</c:if> string">				
										<c:out value="${current.content}"/>
									</td>
						</tr>
					</c:forEach>
				</table>
			</div>
		</div>
</c:if>
	 <div class="plain ">
		<div class="plain EntryUnit">
		    <html:hidden property="enu3Key" styleId="enu3Key"></html:hidden> 
				<table>
					<tr>
						<td colspan="3" class="error">
							<html:errors property="enu3" />
						</td>
					</tr>
					<tr class="row">
							<th valign="middle" class=" header">
								Comment
							</th>
						<td valign="middle" nowrap="nowrap" class=" value">
								<html:textarea styleId="fld4" styleClass=" field" cols="35" rows="8" property="fld4" readonly="false"/>
						</td>
								<td class="error"><span class=" error"><html:errors property="fld4"/></span></td>
					 	</tr>
			<html:hidden property="fld5" styleId="fld5"/>
					<tr>
						<td colspan="3">
					<table>
				      <tr>
					  <td> <input title="Save comment" onclick="$('#page1FormBean')[0].target='_self'" class=" button"  id="button:ln9" name="button:ln9" type="submit" value="Save comment">
 </td>
					</tr>
				    </table>
				   </td>
			   </tr>
		  </table>
		</div>
	</div>
		</td>
		<td>
		</td>
	</tr>
</table>
		</html:form>
		<script type="text/javascript">
			if (typeof wr !== "undefined" && wr.getApp().isConfigurable()) {
				wr.getApp().mergeConfig({
					"ui+": {
						autoFocusFirstWindow: true
					}
				});
			}
		</script>
</webratio:CollectScripts>
<c:if test="${wrBoxed}">
		</div>
		<c:if test="${not wrAjax}">
			<script type="text/javascript">
				jQuery(function($) {
					wr.ui.html.addRemoveListener($("#wr-${wrClientAppName}")[0], $.proxy(wr.runScoped, this, "${wrClientAppName}", wr.LegacyAjaxPlugin.exit));
				});
				wr._configs["${wrClientAppName}"]();
			</script>
		</c:if>
		<c:if test="${not(empty inlineScripts)}">
			<script type="text/javascript">
				wr.runScoped("${wrClientAppName}", function(ajaxRequest, WRAjaxRequest, $H, WRAjax, WRAjaxRequestUtils, WRAjaxRequestQueue, WREvent, WREventUtils, Form) {
					${inlineScripts}
				});
			</script>
		</c:if>
</c:if>
<div style="color: #666; font-family: Tahoma; font-size: small; text-decoration: none;">
	<span>|</span>
	<span>generated by</span>
	<a target="_blank" title="WebRatio | Business Agility and IT Standards for building your custom enterprise applications" href="http://www.webratio.com" style="color: #666;font-family: Tahoma;font-size: small;text-decoration: none;"><span style="color: #036; padding: 0px; margin: 0px;">Web</span><img style="width: 8px; height: 8px; border: 0px; padding: 0px; margin: 0px;" alt="Generated by WebRatio" src="WRResources/WRLogo8.png" /><span style="color: #C00; padding: 0px; margin: 0px;">Ratio</span></a><sup style="font-size: 80%;">&reg;</sup>
	<span>|</span>
</div>
</body>
</html>