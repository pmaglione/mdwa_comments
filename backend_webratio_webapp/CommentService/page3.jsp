<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
	<%@ taglib prefix="html" uri="http://struts.apache.org/tags-html" %>
	<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
	<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
	<%@ taglib prefix="bean" uri="http://struts.apache.org/tags-bean" %>
	<%@ taglib prefix="webratio" uri="http://www.webratio.com/2006/TagLib/JSP20" %>
	<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ page contentType="text/html; charset=UTF-8"%> 
<webratio:Page page="page3"/>
<html>
<head>
  <link href="Resources/favicon.png" rel="shortcut icon"/>
  <base href="<%=wrBaseURI%>"/> 
  <title>Create Product</title>
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
	<link href="<webratio:Resource path="builtin/960_Fluid_Nestable_12.css"/>" type="text/css" rel="stylesheet"></link><!--[data] {"wr-resname": "wr-960gs-12"}-->
	<link href="<webratio:Resource path="wrdefault/css/default.css"/>" type="text/css" rel="stylesheet"></link><!--[data] {"wr-resname": "wrdefault-style"}-->
	<link href="<webratio:Resource path="builtin/grid_elements.css"/>" type="text/css" rel="stylesheet"></link><!--[data] {"wr-resname": "wr-ui-gridsystem"}-->
<script type="text/javascript">if (typeof wr !== "undefined") { wr.ui.html.resx.refreshLoaded(); }</script>
</head>
<body>
	<c:if test="${wrBoxed}">
		<div <c:if test="${not wrAjax}">id="wr-${wrClientAppName}" data-wr-appid="${wrClientAppName}"</c:if> class="wr-appui wr-appui-${wrClientAppName}">
	</c:if>
	<webratio:CollectScripts var="inlineScripts" enabled="${wrBoxed}" eventHandlerWrapper="wr.keepScoped">
			<html:form action="form_page3.do${wrAjax ? '#!ajax=true' : ''}" styleId="page3FormBean" enctype="multipart/form-data">
		<c:if test="${wrBoxed}">
			<script>
				jQuery("#page3FormBean").prop("action", "${wrBaseURI}form_page3.do${wrAjax ? '#!ajax=true' : ''}");
			</script>
		</c:if>
			<html:hidden property="CSRFToken"/>
			<html:hidden property="lastURL" styleId="lastURL_page3"/>
				<input type="hidden" name="ln1" value="<webratio:Link link="ln1"/>"/>
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
		<td align="center"><h1>Create Product</h1></td>
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
&gt;Create Product
		</td>
	</tr>
</table>
<table width="100%" valign="top">
	<tr>
		<td>
		</td>
		<td>
<div class="container_12">
				<div class="grid_12 alpha omega agrd_24">
<table width="100%">
	<tr>
		<td>
			<h2>Product</h2>
		</td>
	</tr>
	<tr>
		<td>
	 <div class="plain ">
		<div class="plain EntryUnit">
		    <html:hidden property="enu2Key" styleId="enu2Key"></html:hidden> 
				<table>
					<tr>
						<td colspan="3" class="error">
							<html:errors property="enu2" />
						</td>
					</tr>
					<tr class="row">
							<th valign="middle" class=" header">
								name
							</th>
						<td valign="middle" nowrap="nowrap" class=" value">
								<html:text  size="25" styleId="fld1" styleClass="wr-submitButtons:ln1  field" property="fld1" readonly="false"/>
						</td>
								<td class="error"><span class=" error"><html:errors property="fld1"/></span></td>
					 	</tr>
					<tr class="row">
							<th valign="middle" class=" header">
								category
							</th>
						<td valign="middle" nowrap="nowrap" class=" value">
								<html:text  size="25" styleId="fld2" styleClass="wr-submitButtons:ln1  field" property="fld2" readonly="false"/>
						</td>
								<td class="error"><span class=" error"><html:errors property="fld2"/></span></td>
					 	</tr>
					<tr>
						<td colspan="3">
					<table>
				      <tr>
					  <td> <input title="Save product" onclick="$('#page3FormBean')[0].target='_self'" class=" button"  id="button:ln1" name="button:ln1" type="submit" value="Save product">
 </td>
					</tr>
				    </table>
				   </td>
			   </tr>
		  </table>
		</div>
	</div>
</td>
	</tr>
</table>
				</div>
					<div class="clear"></div>
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