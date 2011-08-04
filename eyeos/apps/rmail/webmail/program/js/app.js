function rcube_webmail(){
	this.env={};

	this.labels={};

	this.buttons={};

	this.buttons_sel={};

	this.gui_objects={};

	this.gui_containers={};

	this.commands={};

	this.command_handlers={};

	this.onloads=[];
	this.ref="rcmail";
	var j=this;
	this.dblclick_time=500;
	this.message_time=3E3;
	this.identifier_expr=new RegExp("[^0-9a-z-_]","gi");
	this.mimetypes=new Array("text/plain","text/html","text/xml","image/jpeg","image/gif","image/png","application/x-javascript","application/pdf","application/x-shockwave-flash");
	this.env.keep_alive=
	60;
	this.env.request_timeout=180;
	this.env.draft_autosave=0;
	this.env.comm_path="./";
	this.env.bin_path="./bin/";
	this.env.blankpage="program/blank.gif";
	$.ajaxSetup({
		cache:false,
		error:function(a,b,c){
			j.http_error(a,b,c)
			},
		beforeSend:function(a){
			a.setRequestHeader("X-RoundCube-Request",j.env.request_token)
			}
		});
this.set_env=function(a,b){
	if(a!=null&&typeof a=="object"&&!b)for(var c in a)this.env[c]=a[c];else this.env[a]=b
		};

this.add_label=function(a,b){
	this.labels[a]=b
	};

this.register_button=function(a,b,c,
	d,e,f){
	this.buttons[a]||(this.buttons[a]=[]);
	b={
		id:b,
		type:c
	};

	if(d)b.act=d;
	if(e)b.sel=e;
	if(f)b.over=f;
	this.buttons[a][this.buttons[a].length]=b
	};

this.gui_object=function(a,b){
	this.gui_objects[a]=b
	};

this.gui_container=function(a,b){
	this.gui_containers[a]=b
	};

this.add_element=function(a,b){
	this.gui_containers[b]&&this.gui_containers[b].jquery&&this.gui_containers[b].append(a)
	};

this.register_command=function(a,b,c){
	this.command_handlers[a]=b;
	c&&this.enable_command(a,true)
	};

this.add_onload=function(a){
	this.onloads[this.onloads.length]=
	a
	};

this.init=function(){
	var a=this;
	this.task=this.env.task;
	if(!bw.dom||!bw.xmlhttp_test())this.goto_url("error","_code=0x199");
	else{
		for(var b in this.gui_containers)this.gui_containers[b]=$("#"+this.gui_containers[b]);for(b in this.gui_objects)this.gui_objects[b]=rcube_find_object(this.gui_objects[b]);this.init_buttons();
		this.env.framed&&parent.rcmail&&parent.rcmail.set_busy&&parent.rcmail.set_busy(false);
		this.enable_command("logout","mail","addressbook","settings",true);
		this.env.permaurl&&this.enable_command("permaurl",
			true);
		switch(this.task){
			case "mail":
				this.enable_command("list","checkmail","compose","add-contact","search","reset-search","collapse-folder",true);
				if(this.gui_objects.messagelist){
				this.message_list=new rcube_list_widget(this.gui_objects.messagelist,{
					multiselect:true,
					multiexpand:true,
					draggable:true,
					keyboard:true,
					dblclick_time:this.dblclick_time
					});
				this.message_list.row_init=function(c){
					a.init_message_row(c)
					};

				this.message_list.addEventListener("dblclick",function(c){
					a.msglist_dbl_click(c)
					});
				this.message_list.addEventListener("click",
					function(c){
						a.msglist_click(c)
						});
				this.message_list.addEventListener("keypress",function(c){
					a.msglist_keypress(c)
					});
				this.message_list.addEventListener("select",function(c){
					a.msglist_select(c)
					});
				this.message_list.addEventListener("dragstart",function(c){
					a.drag_start(c)
					});
				this.message_list.addEventListener("dragmove",function(c){
					a.drag_move(c)
					});
				this.message_list.addEventListener("dragend",function(c){
					a.drag_end(c)
					});
				this.message_list.addEventListener("expandcollapse",function(c){
					a.msglist_expand(c)
					});
				document.onmouseup=function(c){
					return a.doc_mouse_up(c)
					};

				this.gui_objects.messagelist.parentNode.onmousedown=function(c){
					return a.click_on_list(c)
					};

				this.set_message_coltypes(this.env.coltypes);
				this.message_list.init();
				this.enable_command("toggle_status","toggle_flag","menu-open","menu-save",true);
				this.env.messagecount&&this.command("list")
				}
				if(this.gui_objects.qsearchbox){
				if(this.env.search_text!=null)this.gui_objects.qsearchbox.value=this.env.search_text;
				$(this.gui_objects.qsearchbox).focusin(function(){
					rcmail.message_list.blur()
					})
				}
				this.env.trash_mailbox&&
			this.env.mailbox!=this.env.trash_mailbox&&this.set_alttext("delete","movemessagetotrash");
				if(this.env.action=="show"||this.env.action=="preview"){
				this.enable_command("show","reply","reply-all","forward","moveto","copy","delete","open","mark","edit","viewsource","download","print","load-attachment","load-headers",true);
				if(this.env.next_uid){
					this.enable_command("nextmessage",true);
					this.enable_command("lastmessage",true)
					}
					if(this.env.prev_uid){
					this.enable_command("previousmessage",true);
					this.enable_command("firstmessage",
						true)
					}
					if(this.env.blockedobjects){
					if(this.gui_objects.remoteobjectsmsg)this.gui_objects.remoteobjectsmsg.style.display="block";
					this.enable_command("load-images","always-load",true)
					}
					if(this.env.action=="preview"&&this.env.framed&&parent.rcmail){
					this.enable_command("compose","add-contact",false);
					parent.rcmail.show_contentframe(true)
					}
				}else if(this.env.action=="compose"){
				this.enable_command("add-attachment","send-attachment","remove-attachment","send", "add-filechooser", "add-attachlist",true);
				if(this.env.spellcheck){
					this.env.spellcheck.spelling_state_observer=
					function(c){
						j.set_spellcheck_state(c)
						};

					this.set_spellcheck_state("ready");
					$("input[name='_is_html']").val()=="1"&&this.display_spellcheck_controls(false)
					}
					this.env.drafts_mailbox&&this.enable_command("savedraft",true);
				document.onmouseup=function(c){
					return a.doc_mouse_up(c)
					};
				this.removeTempDir();
				this.init_messageform()
				}else this.env.action=="print"&&window.print();
			if(this.env.messagecount){
				this.enable_command("select-all","select-none","expunge",true);
				this.enable_command("expand-all","expand-unread","collapse-all",this.env.threading)
				}
				this.purge_mailbox_test()&&
			this.enable_command("purge",true);
			this.set_page_buttons();
			if(this.gui_objects.mailboxlist){
				this.env.unread_counts={};

				this.gui_objects.folderlist=this.gui_objects.mailboxlist;
				this.http_request("getunread","")
				}
				if(this.env.mdn_request&&this.env.uid){
				b="_uid="+this.env.uid+"&_mbox="+urlencode(this.env.mailbox);
				confirm(this.get_label("mdnrequest"))?this.http_post("sendmdn",b):this.http_post("mark",b+"&_flag=mdnsent")
				}
				break;
		case "addressbook":
			if(this.gui_objects.folderlist)this.env.contactfolders=$.extend($.extend({},
			this.env.address_sources),this.env.contactgroups);
		if(this.gui_objects.contactslist){
			this.contact_list=new rcube_list_widget(this.gui_objects.contactslist,{
				multiselect:true,
				draggable:this.gui_objects.folderlist?true:false,
				keyboard:true
			});
			this.contact_list.row_init=function(c){
				a.triggerEvent("insertrow",{
					cid:c.uid,
					row:c
				})
				};

			this.contact_list.addEventListener("keypress",function(c){
				a.contactlist_keypress(c)
				});
			this.contact_list.addEventListener("select",function(c){
				a.contactlist_select(c)
				});
			this.contact_list.addEventListener("dragstart",
				function(c){
					a.drag_start(c)
					});
			this.contact_list.addEventListener("dragmove",function(c){
				a.drag_move(c)
				});
			this.contact_list.addEventListener("dragend",function(c){
				a.drag_end(c)
				});
			this.contact_list.init();
			this.env.cid&&this.contact_list.highlight_row(this.env.cid);
			this.gui_objects.contactslist.parentNode.onmousedown=function(c){
				return a.click_on_list(c)
				};

			document.onmouseup=function(c){
				return a.doc_mouse_up(c)
				};

			this.gui_objects.qsearchbox&&$(this.gui_objects.qsearchbox).focusin(function(){
				rcmail.contact_list.blur()
				})
			}
			this.set_page_buttons();
			if(this.env.address_sources&&this.env.address_sources[this.env.source]&&!this.env.address_sources[this.env.source].readonly){
				this.enable_command("add","import",true);
				this.enable_command("group-create",this.env.address_sources[this.env.source].groups)
				}
				this.env.cid&&this.enable_command("show","edit",true);
			(this.env.action=="add"||this.env.action=="edit")&&this.gui_objects.editform?this.enable_command("save",true):this.enable_command("search","reset-search","moveto",true);
			this.contact_list&&this.contact_list.rowcount>
			0&&this.enable_command("export",true);
			this.enable_command("list","listgroup",true);
			break;
		case "settings":
			this.enable_command("preferences","identities","save","folders",true);
			if(this.env.action=="identities")this.enable_command("add",this.env.identities_level<2);
			else if(this.env.action=="edit-identity"||this.env.action=="add-identity"){
			this.enable_command("add",this.env.identities_level<2);
			this.enable_command("save","delete","edit",true)
			}else this.env.action=="folders"&&this.enable_command("subscribe",
			"unsubscribe","create-folder","rename-folder","delete-folder","enable-threading","disable-threading",true);
		if(this.gui_objects.identitieslist){
			this.identity_list=new rcube_list_widget(this.gui_objects.identitieslist,{
				multiselect:false,
				draggable:false,
				keyboard:false
			});
			this.identity_list.addEventListener("select",function(c){
				a.identity_select(c)
				});
			this.identity_list.init();
			this.identity_list.focus();
			this.env.iid&&this.identity_list.highlight_row(this.env.iid)
			}else if(this.gui_objects.sectionslist){
			this.sections_list=
			new rcube_list_widget(this.gui_objects.sectionslist,{
				multiselect:false,
				draggable:false,
				keyboard:false
			});
			this.sections_list.addEventListener("select",function(c){
				a.section_select(c)
				});
			this.sections_list.init();
			this.sections_list.focus()
			}else this.gui_objects.subscriptionlist&&this.init_subscription_list();
			break;
		case "login":
			b=$("#rcmloginuser");
			b.bind("keyup",function(c){
			return rcmail.login_user_keyup(c)
			});
		b.val()==""?b.focus():$("#rcmloginpwd").focus();
			$("#rcmlogintz").val((new Date).getTimezoneOffset()/
			-60);
		this.enable_command("login",true);
			break;
		default:
			break
			}
			this.loaded=true;
	this.pending_message&&this.display_message(this.pending_message[0],this.pending_message[1]);
	if(this.gui_objects.folderlist)this.gui_containers.foldertray=$(this.gui_objects.folderlist);
	this.triggerEvent("init",{
		task:this.task,
		action:this.env.action
		});
	for(b=0;b<this.onloads.length;b++)if(typeof this.onloads[b]=="string")eval(this.onloads[b]);else typeof this.onloads[b]=="function"&&this.onloads[b]();this.start_keepalive()
	}
};
this.command=function(a,b,c){
	c&&c.blur&&c.blur();
	if(this.busy)return false;
	if(!this.commands[a]){
		this.env.framed&&parent.rcmail&&parent.rcmail.command&&parent.rcmail.command(a,b);
		return false
		}
		if(this.task=="mail"&&this.env.action=="compose"&&(a=="list"||a=="mail"||a=="addressbook"||a=="settings"))if(this.cmp_hash!=this.compose_field_hash()&&!confirm(this.get_label("notsentwarning")))return false;
	if(typeof this.command_handlers[a]=="function"){
		a=this.command_handlers[a](b,c);
		return a!==null?a:c?false:
		true
		}else if(typeof this.command_handlers[a]=="string"){
		a=window[this.command_handlers[a]](b,c);
		return a!==null?a:c?false:true
		}
		var d=this.triggerEvent("before"+a,b);
	if(typeof d!="undefined")if(d===false)return false;else b=d;
	switch(a){
		case "login":
			this.gui_objects.loginform&&this.gui_objects.loginform.submit();
			break;
		case "mail":case "addressbook":case "settings":case "logout":
			this.switch_task(a);
			break;
		case "permaurl":
			if(c&&c.href&&c.target)return true;
			else if(this.env.permaurl)parent.location.href=
			this.env.permaurl;
		break;
		case "menu-open":case "menu-save":
			this.triggerEvent(a,{
			props:b
		});
		return false;
		case "open":
			var e;
			if(e=this.get_single_uid()){
			c.href="?_task="+this.env.task+"&_action=show&_mbox="+urlencode(this.env.mailbox)+"&_uid="+e;
			return true
			}
			break;
		case "list":
			if(this.task=="mail"){
			if(this.env.search_request<0||b!=""&&this.env.search_request&&b!=this.env.mailbox)this.reset_qsearch();
			this.list_mailbox(b);
			if(this.env.trash_mailbox)this.set_alttext("delete",this.env.mailbox!=this.env.trash_mailbox?
				"movemessagetotrash":"deletemessage")
			}else if(this.task=="addressbook"){
			if(this.env.search_request<0||this.env.search_request&&b!=this.env.source)this.reset_qsearch();
			this.list_contacts(b);
			this.enable_command("add","import",this.env.address_sources&&!this.env.address_sources[this.env.source].readonly)
			}
			break;
		case "listgroup":
			this.list_contacts(null,b);
			break;
		case "load-headers":
			this.load_headers(c);
			break;
		case "sort":
			var f=b;
			e=this.env.sort_col==f?this.env.sort_order=="ASC"?"DESC":"ASC":"ASC";
			this.set_list_sorting(f,
			e);
		this.list_mailbox("","",f+"_"+e);
			break;
		case "nextpage":
			this.list_page("next");
			break;
		case "lastpage":
			this.list_page("last");
			break;
		case "previouspage":
			this.list_page("prev");
			break;
		case "firstpage":
			this.list_page("first");
			break;
		case "expunge":
			this.env.messagecount&&this.expunge_mailbox(this.env.mailbox);
			break;
		case "purge":case "empty-mailbox":
			this.env.messagecount&&this.purge_mailbox(this.env.mailbox);
			break;
		case "show":
			if(this.task=="mail"){
			if((e=this.get_single_uid())&&(!this.env.uid||e!=this.env.uid))this.env.mailbox==
				this.env.drafts_mailbox?this.goto_url("compose","_draft_uid="+e+"&_mbox="+urlencode(this.env.mailbox),true):this.show_message(e)
				}else if(this.task=="addressbook")(f=b?b:this.get_single_cid())&&!(this.env.action=="show"&&f==this.env.cid)&&this.load_contact(f,"show");
			break;
		case "add":
			if(this.task=="addressbook")this.load_contact(0,"add");
			else if(this.task=="settings"){
			this.identity_list.clear_selection();
			this.load_identity(0,"add-identity")
			}
			break;
		case "edit":
			if(this.task=="addressbook"&&(f=this.get_single_cid()))this.load_contact(f,
			"edit");
		else if(this.task=="settings"&&b)this.load_identity(b,"edit-identity");
			else if(this.task=="mail"&&(f=this.get_single_uid())){
			d=this.env.mailbox==this.env.drafts_mailbox?"_draft_uid=":"_uid=";
			this.goto_url("compose",d+f+"&_mbox="+urlencode(this.env.mailbox),true)
			}
			break;
		case "save-identity":case "save":
			if(this.gui_objects.editform){
			e=$("input[name='_pagesize']");
			f=$("input[name='_name']");
			d=$("input[name='_email']");
			if(e.length&&isNaN(parseInt(e.val()))){
				alert(this.get_label("nopagesizewarning"));
				e.focus();
				break
			}else if(f.length&&f.val()==""){
				alert(this.get_label("nonamewarning"));
				f.focus();
				break
			}else if(d.length&&!rcube_check_email(d.val())){
				alert(this.get_label("noemailwarning"));
				d.focus();
				break
			}
			this.gui_objects.editform.submit()
			}
			break;
		case "delete":
			if(this.task=="mail")this.delete_messages();
			else if(this.task=="addressbook")this.delete_contacts();else this.task=="settings"&&this.delete_identity();
			break;
		case "move":case "moveto":
			if(this.task=="mail")this.move_messages(b);else this.task==
			"addressbook"&&this.drag_active&&this.copy_contact(null,b);
		break;
		case "copy":
			this.task=="mail"&&this.copy_messages(b);
			break;
		case "mark":
			b&&this.mark_message(b);
			break;
		case "toggle_status":
			if(b&&!b._row)break;
			f="read";
			if(b._row.uid){
			e=b._row.uid;
			if(this.message_list.rows[e].deleted)f="undelete";else this.message_list.rows[e].unread||(f="unread")
				}
				this.mark_message(f,e);
			break;
		case "toggle_flag":
			if(b&&!b._row)break;
			f="flagged";
			if(b._row.uid){
			e=b._row.uid;
			if(this.message_list.rows[e].flagged)f="unflagged"
				}
				this.mark_message(f,
			e);
		break;
		case "always-load":
			if(this.env.uid&&this.env.sender){
			this.add_contact(urlencode(this.env.sender));
			window.setTimeout(function(){
				j.command("load-images")
				},300);
			break
		}
		case "load-images":
			this.env.uid&&this.show_message(this.env.uid,true,this.env.action=="preview");
			break;
		case "load-attachment":
			console.log(b);
			e="_mbox="+urlencode(this.env.mailbox)+"&_uid="+this.env.uid+"&_part="+b.part;
		/*if(this.env.uid&&b.mimetype&&$.inArray(b.mimetype,this.mimetypes)>=0){
			if(b.mimetype=="text/html")e+="&_safe=1";
			if(this.attachment_win=
				window.open(this.env.comm_path+"&_action=get&"+e+"&_frame=1","rcubemailattachment")){
				window.setTimeout(function(){
					j.attachment_win.focus()
					},10);
				break
				}
		}*/
		this.goto_url("get",e+"&_download=1",false);
		break;
	case "select-all":
		this.select_all_mode=b?false:true;
		b=="invert"?this.message_list.invert_selection():this.message_list.select_all(b=="page"?"":b);
		break;
	case "select-none":
		this.message_list.clear_selection();
		break;
	case "expand-all":
		this.env.autoexpand_threads=1;
		this.message_list.expand_all();
		break;
	case "expand-unread":
		this.env.autoexpand_threads=
		2;
		this.message_list.collapse_all();
		this.expand_unread();
		break;
	case "collapse-all":
		this.env.autoexpand_threads=0;
		this.message_list.collapse_all();
		break;
	case "nextmessage":
		this.env.next_uid&&this.show_message(this.env.next_uid,false,this.env.action=="preview");
		break;
	case "lastmessage":
		this.env.last_uid&&this.show_message(this.env.last_uid);
		break;
	case "previousmessage":
		this.env.prev_uid&&this.show_message(this.env.prev_uid,false,this.env.action=="preview");
		break;
	case "firstmessage":
		this.env.first_uid&&
		this.show_message(this.env.first_uid);
		break;
	case "checkmail":
		this.check_for_recent(true);
		break;
	case "compose":
		d=this.env.comm_path+"&_action=compose";
		if(this.task=="mail"){
		d+="&_mbox="+urlencode(this.env.mailbox);
		if(this.env.mailbox==this.env.drafts_mailbox){
			if(e=this.get_single_uid())d+="&_draft_uid="+e
				}else if(b)d+="&_to="+urlencode(b)
			}else if(this.task=="addressbook"){
		if(b&&b.indexOf("@")>0){
			d=this.get_task_url("mail",d);
			this.redirect(d+"&_to="+urlencode(b));
			break
		}
		e=[];
		if(b)e[e.length]=b;
		else if(this.contact_list){
			f=
			this.contact_list.get_selection();
			for(d=0;d<f.length;d++)e[e.length]=f[d]
				}
				e.length&&this.http_request("mailto","_cid="+urlencode(e.join(","))+"&_source="+urlencode(this.env.source),true);
		break
	}
	d=d.replace(/&_framed=1/,"");
		this.redirect(d);
		break;
	case "spellcheck":
		if(window.tinyMCE&&tinyMCE.get(this.env.composebody))tinyMCE.execCommand("mceSpellCheck",true);
		else if(this.env.spellcheck&&this.env.spellcheck.spellCheck&&this.spellcheck_ready){
		this.env.spellcheck.spellCheck();
		this.set_spellcheck_state("checking")
		}
		break;
	case "savedraft":
		self.clearTimeout(this.save_timer);
		if(!this.gui_objects.messageform)break;
		if(!this.env.drafts_mailbox||this.cmp_hash==this.compose_field_hash())break;
		this.set_busy(true,"savingmessage");
		e=this.gui_objects.messageform;
		e.target="savetarget";
		e._draft.value="1";
		e.submit();
		break;
	case "send":
		if(!this.gui_objects.messageform)break;
		if(!this.check_compose_input())break;
		self.clearTimeout(this.save_timer);
		this.set_busy(true,"sendingmessage");
		e=this.gui_objects.messageform;
		e.target="savetarget";
		e._draft.value="";
		e.submit();
		clearTimeout(this.request_timer);
		break;
	case "add-filechooser":
		this.show_fileChooser_eyeos(b);
	case "add-attachment":
		this.show_attachment_form(true);
	case "send-attachment":
		/*self.clearTimeout(this.save_timer);
		this.upload_file(b);*/
		break;
	case "add-attachlist":
		this.build_attachments_list(b);
	case "remove-attachment":
		this.remove_attachment(b);
		break;
	case "insert-sig":
		this.change_identity($("[name='_from']")[0],true);
		break;
	case "reply-all":case "reply":
		if(e=this.get_single_uid())this.goto_url("compose","_reply_uid="+e+"&_mbox="+urlencode(this.env.mailbox)+(a=="reply-all"?"&_all=1":""),
		true);
	break;
	case "forward":
		if(e=this.get_single_uid())this.goto_url("compose","_forward_uid="+e+"&_mbox="+urlencode(this.env.mailbox),true);
		break;
	case "print":
		if(e=this.get_single_uid()){
		j.printwin=window.open(this.env.comm_path+"&_action=print&_uid="+e+"&_mbox="+urlencode(this.env.mailbox)+(this.env.safemode?"&_safe=1":""));
		if(this.printwin){
			window.setTimeout(function(){
				j.printwin.focus()
				},20);
			this.env.action!="show"&&this.mark_message("read",e)
			}
		}
	break;
case "viewsource":
	if(e=this.get_single_uid()){
	j.sourcewin=
	window.open(this.env.comm_path+"&_action=viewsource&_uid="+e+"&_mbox="+urlencode(this.env.mailbox));
	this.sourcewin&&window.setTimeout(function(){
		j.sourcewin.focus()
		},20)
	}
	break;
case "download":
	if(e=this.get_single_uid())this.goto_url("viewsource","&_uid="+e+"&_mbox="+urlencode(this.env.mailbox)+"&_save=1");
	break;
case "add-contact":
	this.add_contact(b);
	break;
case "search":
	if(!b&&this.gui_objects.qsearchbox)b=this.gui_objects.qsearchbox.value;
	if(b){
	this.qsearch(b);
	break
}
case "reset-search":
	e=this.env.search_request;
	this.reset_qsearch();
	if(e&&this.env.mailbox)this.list_mailbox(this.env.mailbox);else e&&this.task=="addressbook"&&this.list_contacts(this.env.source,this.env.group);
	break;
case "group-create":
	this.add_contact_group(b);
	break;
case "group-rename":
	this.rename_contact_group();
	break;
case "group-delete":
	this.delete_contact_group();
	break;
case "import":
	if(this.env.action=="import"&&this.gui_objects.importform){
	if((e=document.getElementById("rcmimportfile"))&&!e.value){
		alert(this.get_label("selectimportfile"));
		break
	}
	this.gui_objects.importform.submit();
	this.set_busy(true,"importwait");
	this.lock_form(this.gui_objects.importform,true)
	}else this.goto_url("import",this.env.source?"_target="+urlencode(this.env.source)+"&":"");
	break;
case "export":
	if(this.contact_list.rowcount>0){
	e=this.env.source?"_source="+urlencode(this.env.source)+"&":"";
	if(this.env.search_request)e+="_search="+this.env.search_request;
	this.goto_url("export",e)
	}
	break;
case "collapse-folder":
	b&&this.collapse_folder(b);
	break;
case "preferences":
	this.goto_url("");
	break;
case "identities":
	this.goto_url("identities");
	break;
case "delete-identity":
	this.delete_identity();
case "folders":
	this.goto_url("folders");
	break;
case "subscribe":
	this.subscribe_folder(b);
	break;
case "unsubscribe":
	this.unsubscribe_folder(b);
	break;
case "enable-threading":
	this.enable_threading(b);
	break;
case "disable-threading":
	this.disable_threading(b);
	break;
case "create-folder":
	this.create_folder(b);
	break;
case "rename-folder":
	this.rename_folder(b);
	break;
case "delete-folder":
	this.delete_folder(b);
	break
	}
	this.triggerEvent("after"+a,b);
return c?false:true
};

this.enable_command=function(){
	var a=arguments;
	if(!a.length)return-1;
	for(var b,c=a[a.length-1],d=0;d<a.length-1;d++){
		b=a[d];
		this.commands[b]=c;
		this.set_button(b,c?"act":"pas")
		}
		return true
	};

this.set_busy=function(a,b){
	if(a&&b){
		var c=this.get_label(b);
		if(c==b)c="Loading...";
		this.display_message(c,"loading",true)
		}else a||this.hide_message();
	this.busy=a;
	this.gui_objects.editform&&this.lock_form(this.gui_objects.editform,a);
	this.request_timer&&
	clearTimeout(this.request_timer);
	if(a&&this.env.request_timeout)this.request_timer=window.setTimeout(function(){
		j.request_timed_out()
		},this.env.request_timeout*1E3)
	};

this.gettext=this.get_label=function(a,b){
	return b&&this.labels[b+"."+a]?this.labels[b+"."+a]:this.labels[a]?this.labels[a]:a
	};

this.switch_task=function(a){
	if(!(this.task===a&&a!="mail")){
		var b=this.get_task_url(a);
		if(a=="mail")b+="&_mbox=INBOX";
		this.redirect(b)
		}
	};

this.get_task_url=function(a,b){
	if(!b)b=this.env.comm_path;
	return b.replace(/_task=[a-z]+/,
		"_task="+a)
	};

this.request_timed_out=function(){
	this.set_busy(false);
	this.display_message("Request timed out!","error")
	};

this.reload=function(a){
	if(this.env.framed&&parent.rcmail)parent.rcmail.reload(a);
	else if(a)window.setTimeout(function(){
		rcmail.reload()
		},a);
	else if(window.location)location.href=this.env.comm_path
		};

this.drag_menu=function(a,b){
	var c=rcube_event.get_modifier(a),d=$("#"+this.gui_objects.message_dragmenu);
	if(d&&c==SHIFT_KEY&&this.commands.copy){
		a=rcube_event.get_mouse_pos(a);
		this.env.drag_target=
		b;
		d.css({
			top:a.y-10+"px",
			left:a.x-10+"px"
			}).show();
		return true
		}
		return false
	};

this.drag_menu_action=function(a){
	var b=$("#"+this.gui_objects.message_dragmenu);
	b&&b.hide();
	this.command(a,this.env.drag_target);
	this.env.drag_target=null
	};

this.drag_start=function(a){
	var b=this.task=="mail"?this.env.mailboxes:this.env.contactfolders;
	this.drag_active=true;
	this.preview_timer&&clearTimeout(this.preview_timer);
	this.preview_read_timer&&clearTimeout(this.preview_read_timer);
	if(this.gui_objects.folderlist&&b){
		this.initialBodyScrollTop=
		bw.ie?0:window.pageYOffset;
		this.initialListScrollTop=this.gui_objects.folderlist.parentNode.scrollTop;
		var c,d;
		a=$(this.gui_objects.folderlist);
		c=a.offset();
		this.env.folderlist_coords={
			x1:c.left,
			y1:c.top,
			x2:c.left+a.width(),
			y2:c.top+a.height()
			};

		this.env.folder_coords=[];
		for(var e in b)if(a=this.get_folder_li(e))if(d=a.firstChild.offsetHeight){
			c=$(a.firstChild).offset();
			this.env.folder_coords[e]={
				x1:c.left,
				y1:c.top,
				x2:c.left+a.firstChild.offsetWidth,
				y2:c.top+d,
				on:0
			}
		}
		}
		};

this.drag_end=function(){
	this.drag_active=
	false;
	this.env.last_folder_target=null;
	if(this.folder_auto_timer){
		window.clearTimeout(this.folder_auto_timer);
		this.folder_auto_expand=this.folder_auto_timer=null
		}
		if(this.gui_objects.folderlist&&this.env.folder_coords)for(var a in this.env.folder_coords)this.env.folder_coords[a].on&&$(this.get_folder_li(a)).removeClass("droptarget")
		};

this.drag_move=function(a){
	if(this.gui_objects.folderlist&&this.env.folder_coords){
		var b=-(this.initialListScrollTop-this.gui_objects.folderlist.parentNode.scrollTop)-
		(bw.ie?-document.documentElement.scrollTop:this.initialBodyScrollTop),c;
		a=rcube_event.get_mouse_pos(a);
		c=this.env.folderlist_coords;
		a.y+=b;
		if(a.x<c.x1||a.x>=c.x2||a.y<c.y1||a.y>=c.y2){
			if(this.env.last_folder_target){
				$(this.get_folder_li(this.env.last_folder_target)).removeClass("droptarget");
				this.env.folder_coords[this.env.last_folder_target].on=0;
				this.env.last_folder_target=null
				}
			}else for(var d in this.env.folder_coords){
		c=this.env.folder_coords[d];
		if(a.x>=c.x1&&a.x<c.x2&&a.y>=c.y1&&a.y<c.y2&&this.check_droptarget(d)){
			b=
			this.get_folder_li(d);
			c=$(b.getElementsByTagName("div")[0]);
			if(c.hasClass("collapsed")){
				this.folder_auto_timer&&window.clearTimeout(this.folder_auto_timer);
				this.folder_auto_expand=d;
				this.folder_auto_timer=window.setTimeout(function(){
					rcmail.command("collapse-folder",rcmail.folder_auto_expand);
					rcmail.drag_start(null)
					},1E3)
				}else if(this.folder_auto_timer){
				window.clearTimeout(this.folder_auto_timer);
				this.folder_auto_expand=this.folder_auto_timer=null
				}
				$(b).addClass("droptarget");
			this.env.last_folder_target=
			d;
			this.env.folder_coords[d].on=1
			}else if(c.on){
			$(this.get_folder_li(d)).removeClass("droptarget");
			this.env.folder_coords[d].on=0
			}
		}
	}
	};

this.collapse_folder=function(a){
	var b=this.get_folder_li(a),c=$(b.getElementsByTagName("div")[0]);
	if(!(!c||!c.hasClass("collapsed")&&!c.hasClass("expanded"))){
		var d=$(b.getElementsByTagName("ul")[0]);
		if(c.hasClass("collapsed")){
			d.show();
			c.removeClass("collapsed").addClass("expanded");
			this.set_env("collapsed_folders",this.env.collapsed_folders.replace(new RegExp("&"+
				urlencode(a)+"&"),""))
			}else{
			d.hide();
			c.removeClass("expanded").addClass("collapsed");
			this.set_env("collapsed_folders",this.env.collapsed_folders+"&"+urlencode(a)+"&");
			this.env.mailbox.indexOf(a+this.env.delimiter)==0&&this.command("list",a)
			}
			if(bw.ie6||bw.ie7)if((c=b.nextSibling?b.nextSibling.getElementsByTagName("ul"):null)&&c.length&&(b=c[0])&&b.style&&b.style.display!="none"){
			b.style.display="none";
			b.style.display=""
			}
			this.http_post("save-pref","_name=collapsed_folders&_value="+urlencode(this.env.collapsed_folders));
		this.set_unread_count_display(a,false)
		}
	};

this.doc_mouse_up=function(a){
	var b,c;
	if(this.message_list){
		rcube_mouse_is_over(a,this.message_list.list.parentNode)?this.message_list.focus():this.message_list.blur();
		c=this.message_list;
		b=this.env.mailboxes
		}else if(this.contact_list){
		rcube_mouse_is_over(a,this.contact_list.list.parentNode)?this.contact_list.focus():this.contact_list.blur();
		c=this.contact_list;
		b=this.env.contactfolders
		}else this.ksearch_value&&this.ksearch_blur();
	if(this.drag_active&&b&&this.env.last_folder_target){
		b=
		b[this.env.last_folder_target];
		$(this.get_folder_li(this.env.last_folder_target)).removeClass("droptarget");
		this.env.last_folder_target=null;
		c.draglayer.hide();
		this.drag_menu(a,b)||this.command("moveto",b)
		}
		if(this.buttons_sel){
		for(var d in this.buttons_sel)typeof d!="function"&&this.button_out(this.buttons_sel[d],d);this.buttons_sel={}
	}
};

this.click_on_list=function(){
	this.gui_objects.qsearchbox&&this.gui_objects.qsearchbox.blur();
	if(this.message_list)this.message_list.focus();else this.contact_list&&
		this.contact_list.focus();
	return true
	};

this.msglist_select=function(a){
	this.preview_timer&&clearTimeout(this.preview_timer);
	this.preview_read_timer&&clearTimeout(this.preview_read_timer);
	var b=a.get_single_selection()!=null;
	if(this.env.mailbox==this.env.drafts_mailbox){
		this.enable_command("reply","reply-all","forward",false);
		this.enable_command("show","print","open","edit","download","viewsource",b)
		}else this.enable_command("show","reply","reply-all","forward","print","edit","open","download","viewsource",
		b);
	this.enable_command("delete","moveto","copy","mark",a.selection.length>0?true:false);
	if(b&&this.env.contentframe&&!a.multi_selecting)this.preview_timer=window.setTimeout(function(){
		j.msglist_get_preview()
		},200);else this.env.contentframe&&this.show_contentframe(false)
		};

this.msglist_click=function(a){
	if(!(a.multi_selecting||!this.env.contentframe))if(a.get_single_selection()&&window.frames&&window.frames[this.env.contentframe])if(window.frames[this.env.contentframe].location.href.indexOf(this.env.blankpage)>=
		0){
		this.preview_timer&&clearTimeout(this.preview_timer);
		this.preview_read_timer&&clearTimeout(this.preview_read_timer);
		this.preview_timer=window.setTimeout(function(){
			j.msglist_get_preview()
			},200)
		}
	};

this.msglist_dbl_click=function(a){
	this.preview_timer&&clearTimeout(this.preview_timer);
	this.preview_read_timer&&clearTimeout(this.preview_read_timer);
	if((a=a.get_single_selection())&&this.env.mailbox==this.env.drafts_mailbox)this.goto_url("compose","_draft_uid="+a+"&_mbox="+urlencode(this.env.mailbox),
		true);else a&&this.show_message(a,false,false)
		};

this.msglist_keypress=function(a){
	if(a.key_pressed==a.ENTER_KEY)this.command("show");
	else if(a.key_pressed==a.DELETE_KEY)this.command("delete");
	else if(a.key_pressed==a.BACKSPACE_KEY)this.command("delete");
	else if(a.key_pressed==33)this.command("previouspage");
	else if(a.key_pressed==34)this.command("nextpage");else a.shiftkey=false
		};

this.msglist_get_preview=function(){
	var a=this.get_single_uid();
	if(a&&this.env.contentframe&&!this.drag_active)this.show_message(a,
		false,true);else this.env.contentframe&&this.show_contentframe(false)
		};

this.msglist_expand=function(a){
	if(this.env.messages[a.uid])this.env.messages[a.uid].expanded=a.expanded
		};

this.check_droptarget=function(a){
	if(this.task=="mail")return this.env.mailboxes[a]&&this.env.mailboxes[a].id!=this.env.mailbox&&!this.env.mailboxes[a].virtual;
	else if(this.task=="addressbook")return a!=this.env.source&&this.env.contactfolders[a]&&!this.env.contactfolders[a].readonly&&!(!this.env.source&&this.env.contactfolders[a].group)&&
		!(this.env.contactfolders[a].type=="group"&&this.env.contactfolders[a].id==this.env.group);
	else if(this.task=="settings")return a!=this.env.folder
		};

this.init_message_row=function(a){
	var b,c=this,d=a.uid;
	d&&this.env.messages[d]&&$.extend(a,this.env.messages[d]);
	if(this.env.subject_col!=null&&(a.icon=document.getElementById("msgicn"+a.uid))){
		a.icon._row=a.obj;
		a.icon.onmousedown=function(){
			c.command("toggle_status",this)
			}
		}
	if(this.env.flagged_col!=null&&(a.flagged_icon=document.getElementById("flaggedicn"+
	a.uid))){
	a.flagged_icon._row=a.obj;
	a.flagged_icon.onmousedown=function(){
		c.command("toggle_flag",this)
		}
	}
if(!a.depth&&a.has_children&&(b=document.getElementById("rcmexpando"+a.uid)))b.onmousedown=function(e){
	return c.expand_message_row(e,d)
	};

this.triggerEvent("insertrow",{
	uid:d,
	row:a
})
};

this.add_message_row=function(a,b,c,d){
	if(!this.gui_objects.messagelist||!this.message_list)return false;
	var e=this.message_list.background?this.message_list.background:this.gui_objects.messagelist.tBodies[0];
	this.env.messages[a]||
	(this.env.messages[a]={});
	$.extend(this.env.messages[a],{
		deleted:c.deleted?1:0,
		replied:c.replied?1:0,
		unread:c.unread?1:0,
		forwarded:c.forwarded?1:0,
		flagged:c.flagged?1:0,
		has_children:c.has_children?1:0,
		depth:c.depth?c.depth:0,
		unread_children:c.unread_children,
		parent_uid:c.parent_uid
		});
	var f,g=expando="";
	f=this.message_list.rows;
	var h=this.env.messages[a],k="message"+(e.rows.length%2?" even":" odd")+(c.unread?" unread":"")+(c.deleted?" deleted":"")+(c.flagged?" flagged":"")+(c.unread_children&&!c.unread&&
		!this.env.autoexpand_threads?" unroot":"")+(this.message_list.in_selection(a)?" selected":"");
	e=document.createElement("tr");
	var l=document.createElement("td");
	e.id="rcmrow"+a;
	e.className=k;
	k=this.env.messageicon;
	if(!c.unread&&c.unread_children>0&&this.env.unreadchildrenicon)k=this.env.unreadchildrenicon;
	else if(c.deleted&&this.env.deletedicon)k=this.env.deletedicon;
	else if(c.replied&&this.env.repliedicon)k=c.forwarded&&this.env.forwardedrepliedicon?this.env.forwardedrepliedicon:this.env.repliedicon;
	else if(c.forwarded&&this.env.forwardedicon)k=this.env.forwardedicon;
	else if(c.unread&&this.env.unreadicon)k=this.env.unreadicon;
	if(this.env.threading){
		var n=h.depth*15;
		if(h.depth)if((this.env.autoexpand_threads==0||this.env.autoexpand_threads==2)&&(!f[h.parent_uid]||!f[h.parent_uid].expanded)){
			e.style.display="none";
			h.expanded=false
			}else h.expanded=true;
		else if(h.has_children)if(typeof h.expanded=="undefined"&&(this.env.autoexpand_threads==1||this.env.autoexpand_threads==2&&h.unread_children))h.expanded=
			true;
		if(n)g+='<span id="rcmtab'+a+'" class="branch" style="width:'+n+'px;">&nbsp;&nbsp;</span>';
		if(h.has_children&&!h.depth)expando='<div id="rcmexpando'+a+'" class="'+(h.expanded?"expanded":"collapsed")+'">&nbsp;&nbsp;</div>'
			}
			g+=k?'<img id="msgicn'+a+'" src="'+k+'" alt="" class="msgicon" />':"";
	l.className="threads";
	l.innerHTML=expando;
	e.appendChild(l);
	if(!bw.ie&&b.subject){
		l=c.mbox==this.env.drafts_mailbox?"_draft_uid":"_uid";
		b.subject='<a href="./?_task=mail&_action='+(c.mbox==this.env.drafts_mailbox?
			"compose":"show")+"&_mbox="+urlencode(c.mbox)+"&"+l+"="+a+'" onclick="return rcube_event.cancel(event)">'+b.subject+"</a>"
		}
		for(h=0;h<this.env.coltypes.length;h++){
		f=this.env.coltypes[h];
		l=document.createElement("td");
		l.className=String(f).toLowerCase();
		var m;
		if(f=="flag")if(c.flagged&&this.env.flaggedicon)m='<img id="flaggedicn'+a+'" src="'+this.env.flaggedicon+'" class="flagicon" alt="" />';
			else{
			if(!c.flagged&&this.env.unflaggedicon)m='<img id="flaggedicn'+a+'" src="'+this.env.unflaggedicon+'" class="flagicon" alt="" />'
				}else m=
			f=="attachment"?c.attachment&&this.env.attachmenticon?'<img src="'+this.env.attachmenticon+'" alt="" />':"&nbsp;":f=="subject"?g+b[f]:b[f];
		l.innerHTML=m;
		e.appendChild(l)
		}
		this.message_list.insert_row(e,d);
	if(d&&this.env.pagesize&&this.message_list.rowcount>this.env.pagesize){
		a=this.message_list.get_last_row();
		this.message_list.remove_row(a);
		this.message_list.clear_selection(a)
		}
	};

this.offline_message_list=function(a){
	this.message_list&&this.message_list.set_background_mode(a)
	};

this.set_list_sorting=
function(a,b){
	$("#rcm"+this.env.sort_col).removeClass("sorted"+this.env.sort_order.toUpperCase());
	a&&$("#rcm"+a).addClass("sorted"+b);
	this.env.sort_col=a;
	this.env.sort_order=b
	};

this.set_list_options=function(a,b,c,d){
	var e,f="";
	if(this.env.sort_col!=b||this.env.sort_order!=c){
		e=1;
		this.set_list_sorting(b,c)
		}
		if(this.env.threading!=d){
		e=1;
		f+="&_threads="+d
		}
		if(a.join()!=this.env.coltypes.join()){
		e=1;
		f+="&_cols="+a.join(",")
		}
		e&&this.list_mailbox("","",b+"_"+c,f)
	};

this.show_message=function(a,b,c){
	if(a){
		var d=
		"",e=window,f=c?"preview":"show";
		if(c&&this.env.contentframe&&window.frames&&window.frames[this.env.contentframe]){
			e=window.frames[this.env.contentframe];
			d="&_framed=1"
			}
			if(b)d="&_safe=1";
		if(this.env.search_request)d+="&_search="+this.env.search_request;
		b="&_action="+f+"&_uid="+a+"&_mbox="+urlencode(this.env.mailbox)+d;
		if(f=="preview"&&String(e.location.href).indexOf(b)>=0)this.show_contentframe(true);
		else{
			this.set_busy(true,"loading");
			e.location.href=this.env.comm_path+b;
			if(f=="preview"&&this.message_list&&
				this.message_list.rows[a]&&this.message_list.rows[a].unread&&this.env.preview_pane_mark_read>=0)this.preview_read_timer=window.setTimeout(function(){
				j.set_message(a,"unread",false);
				j.update_thread_root(a,"read");
				if(j.env.unread_counts[j.env.mailbox]){
					j.env.unread_counts[j.env.mailbox]-=1;
					j.set_unread_count(j.env.mailbox,j.env.unread_counts[j.env.mailbox],j.env.mailbox=="INBOX")
					}
					j.env.preview_pane_mark_read>0&&j.http_post("mark","_uid="+a+"&_flag=read")
				},this.env.preview_pane_mark_read*1E3)
			}
			}
};

this.show_contentframe=
function(a){
	var b;
	if(this.env.contentframe&&(b=$("#"+this.env.contentframe))&&b.length)if(!a&&window.frames[this.env.contentframe]){
		if(window.frames[this.env.contentframe].location.href.indexOf(this.env.blankpage)<0)window.frames[this.env.contentframe].location.href=this.env.blankpage
			}else if(!bw.safari&&!bw.konq)b[a?"show":"hide"]();
	!a&&this.busy&&this.set_busy(false)
	};

this.list_page=function(a){
	if(a=="next")a=this.env.current_page+1;
	if(a=="last")a=this.env.pagecount;
	if(a=="prev"&&this.env.current_page>
		1)a=this.env.current_page-1;
	if(a=="first"&&this.env.current_page>1)a=1;
	if(a>0&&a<=this.env.pagecount){
		this.env.current_page=a;
		if(this.task=="mail")this.list_mailbox(this.env.mailbox,a);else this.task=="addressbook"&&this.list_contacts(this.env.source,null,a)
			}
		};

this.filter_mailbox=function(a){
	var b;
	if(this.gui_objects.qsearchbox)b=this.gui_objects.qsearchbox.value;
	this.message_list.clear();
	this.env.current_page=1;
	this.set_busy(true,"searching");
	this.http_request("search","_filter="+a+(b?"&_q="+urlencode(b):
		"")+(this.env.mailbox?"&_mbox="+urlencode(this.env.mailbox):""),true)
	};

this.list_mailbox=function(a,b,c,d){
	var e="",f=window;
	if(!a)a=this.env.mailbox;
	if(d)e+=d;
	if(c)e+="&_sort="+c;
	if(this.env.search_request)e+="&_search="+this.env.search_request;
	if(!b&&this.env.mailbox!=a){
		b=1;
		this.env.current_page=b;
		this.show_contentframe(false)
		}
		if(a!=this.env.mailbox||a==this.env.mailbox&&!b&&!c)e+="&_refresh=1";
	this.last_selected=0;
	if(this.message_list){
		this.message_list.clear_selection();
		this.select_all_mode=
		false
		}
		this.select_folder(a,this.env.mailbox);
	this.env.mailbox=a;
	if(this.gui_objects.messagelist)this.list_mailbox_remote(a,b,e);
	else{
		if(this.env.contentframe&&window.frames&&window.frames[this.env.contentframe]){
			f=window.frames[this.env.contentframe];
			e+="&_framed=1"
			}
			if(a){
			this.set_busy(true,"loading");
			f.location.href=this.env.comm_path+"&_mbox="+urlencode(a)+(b?"&_page="+b:"")+e
			}
		}
};

this.list_mailbox_remote=function(a,b,c){
	this.message_list.clear();
	a="_mbox="+urlencode(a)+(b?"&_page="+b:"");
	this.set_busy(true,
		"loading");
	this.http_request("list",a+c,true)
	};

this.expand_unread=function(){
	for(var a,b,c=this.gui_objects.messagelist.tBodies[0].firstChild;c;){
		if(c.nodeType==1&&(a=this.message_list.rows[c.uid])&&a.unread_children){
			this.message_list.expand_all(a);
			if(b=document.getElementById("rcmexpando"+a.uid))b.className="expanded";
			this.set_unread_children(a.uid)
			}
			c=c.nextSibling
		}
		return false
	};

this.expand_message_row=function(a,b){
	var c=this.message_list.rows[b];
	c.expanded=!c.expanded;
	this.set_unread_children(b);
	c.expanded=!c.expanded;
	this.message_list.expand_row(a,b)
	};

this.expand_threads=function(){
	if(!(!this.env.threading||!this.env.autoexpand_threads||!this.message_list))switch(this.env.autoexpand_threads){
		case 2:
			this.expand_unread();
			break;
		case 1:
			this.message_list.expand_all();
			break
			}
		};

this.update_thread_root=function(a,b){
	if(this.env.threading){
		var c=this.message_list.find_root(a);
		if(a!=c){
			a=this.message_list.rows[c];
			if(b=="read"&&a.unread_children)a.unread_children--;
			else if(b=="unread"&&a.has_children)a.unread_children=
				a.unread_children?a.unread_children+1:1;else return;
			this.set_message_icon(c);
			this.set_unread_children(c)
			}
		}
};

this.update_thread=function(a){
	if(!this.env.threading)return 0;
	var b,c=0,d=this.message_list.rows,e=d[a],f=d[a].depth,g=[];
	if(e.depth){
		if(e.unread){
			a=this.message_list.find_root(a);
			d[a].unread_children--;
			this.set_unread_children(a)
			}
		}else c--;
a=e.parent_uid;
for(e=e.obj.nextSibling;e;){
	if(e.nodeType==1&&(b=d[e.uid])){
		if(!b.depth||b.depth<=f)break;
		b.depth--;
		$("#rcmtab"+b.uid).width(b.depth*15);
		if(b.depth){
			if(b.depth==f)b.parent_uid=a;
			b.unread&&g.length&&g[g.length-1].unread_children++
		}else{
			c++;
			b.parent_uid=0;
			if(b.has_children){
				$("#rcmrow"+b.uid+" .leaf:first").attr("id","rcmexpando"+b.uid).attr("class",b.obj.style.display!="none"?"expanded":"collapsed").bind("mousedown",{
					uid:b.uid,
					p:this
				},function(h){
					return h.data.p.expand_message_row(h,h.data.uid)
					});
				b.unread_children=0;
				g[g.length]=b
				}
				b.obj.style.display=="none"&&$(b.obj).show()
			}
		}
	e=e.nextSibling
}
for(b=0;b<g.length;b++)this.set_unread_children(g[b].uid);
return c
};

this.delete_excessive_thread_rows=function(){
	for(var a=this.message_list.rows,b=this.message_list.list.tBodies[0].firstChild,c=this.env.pagesize+1;b;){
		if(b.nodeType==1&&(r=a[b.uid])){
			!r.depth&&c&&c--;
			c||this.message_list.remove_row(b.uid)
			}
			b=b.nextSibling
		}
	};

this.set_message_icon=function(a){
	var b,c=this.message_list.rows;
	if(!c[a])return false;
	if(!c[a].unread&&c[a].unread_children&&this.env.unreadchildrenicon)b=this.env.unreadchildrenicon;
	else if(c[a].deleted&&this.env.deletedicon)b=this.env.deletedicon;
	else if(c[a].replied&&this.env.repliedicon)b=c[a].forwarded&&this.env.forwardedrepliedicon?this.env.forwardedrepliedicon:this.env.repliedicon;
	else if(c[a].forwarded&&this.env.forwardedicon)b=this.env.forwardedicon;
	else if(c[a].unread&&this.env.unreadicon)b=this.env.unreadicon;
	else if(this.env.messageicon)b=this.env.messageicon;
	if(b&&c[a].icon)c[a].icon.src=b;
	b="";
	if(c[a].flagged&&this.env.flaggedicon)b=this.env.flaggedicon;
	else if(!c[a].flagged&&this.env.unflaggedicon)b=this.env.unflaggedicon;
	if(c[a].flagged_icon&&
		b)c[a].flagged_icon.src=b
		};

this.set_message_status=function(a,b,c){
	var d=this.message_list.rows;
	if(!d[a])return false;
	if(b=="unread")d[a].unread=c;
	else if(b=="deleted")d[a].deleted=c;
	else if(b=="replied")d[a].replied=c;
	else if(b=="forwarded")d[a].forwarded=c;
	else if(b=="flagged")d[a].flagged=c
		};

this.set_message=function(a,b,c){
	var d=this.message_list.rows;
	if(!d[a])return false;
	b&&this.set_message_status(a,b,c);
	b=$(d[a].obj);
	if(d[a].unread&&!b.hasClass("unread"))b.addClass("unread");else!d[a].unread&&
		b.hasClass("unread")&&b.removeClass("unread");
	if(d[a].deleted&&!b.hasClass("deleted"))b.addClass("deleted");else!d[a].deleted&&b.hasClass("deleted")&&b.removeClass("deleted");
	if(d[a].flagged&&!b.hasClass("flagged"))b.addClass("flagged");else!d[a].flagged&&b.hasClass("flagged")&&b.removeClass("flagged");
	this.set_unread_children(a);
	this.set_message_icon(a)
	};

this.set_unread_children=function(a){
	a=this.message_list.rows[a];
	a.parent_uid||!a.has_children||(!a.unread&&a.unread_children&&!a.expanded?$(a.obj).addClass("unroot"):
		$(a.obj).removeClass("unroot"))
	};

this.copy_messages=function(a){
	if(!(!a||a==this.env.mailbox||!this.env.uid&&(!this.message_list||!this.message_list.get_selection().length))){
		a="&_target_mbox="+urlencode(a)+"&_from="+(this.env.action?this.env.action:"");
		var b=[];
		if(this.env.uid)b[0]=this.env.uid;else for(var c=this.message_list.get_selection(),d,e=0;e<c.length;e++){
			d=c[e];
			b[b.length]=d
			}
			this.http_post("copy","_uid="+b.join(",")+"&_mbox="+urlencode(this.env.mailbox)+a,false)
		}
	};

this.move_messages=function(a){
	if(a&&
		typeof a=="object")a=a.id;
	if(!(!a||a==this.env.mailbox||!this.env.uid&&(!this.message_list||!this.message_list.get_selection().length))){
		var b=false;
		a="&_target_mbox="+urlencode(a)+"&_from="+(this.env.action?this.env.action:"");
		if(this.env.action=="show"){
			b=true;
			this.set_busy(true,"movingmessage")
			}else this.show_contentframe(false);
		this.enable_command("reply","reply-all","forward","delete","mark","print","open","edit","viewsource","download",false);
		this._with_selected_messages("moveto",b,a)
		}
	};

this.delete_messages=
function(){
	var a=this.message_list?$.merge([],this.message_list.get_selection()):[];
	if(this.env.uid||a.length){
		for(var b,c=0;c<a.length;c++){
			b=a[c];
			this.message_list.rows[b].has_children&&!this.message_list.rows[b].expanded&&this.message_list.select_childs(b)
			}
			if(this.env.flag_for_deletion){
			this.mark_message("delete");
			return false
			}else if(!this.env.trash_mailbox||this.env.mailbox==this.env.trash_mailbox)this.permanently_remove_messages();
		else if(this.message_list&&this.message_list.shiftkey)confirm(this.get_label("deletemessagesconfirm"))&&
			this.permanently_remove_messages();else this.move_messages(this.env.trash_mailbox);
		return true
		}
	};

this.permanently_remove_messages=function(){
	if(!(!this.env.uid&&(!this.message_list||!this.message_list.get_selection().length))){
		this.show_contentframe(false);
		this._with_selected_messages("delete",false,"&_from="+(this.env.action?this.env.action:""))
		}
	};

this._with_selected_messages=function(a,b,c){
	var d=[],e=0;
	if(this.env.uid)d[0]=this.env.uid;
	else{
		for(var f=this.message_list.get_selection(),g,h=0;h<f.length;h++){
			g=
			f[h];
			d[d.length]=g;
			e+=this.update_thread(g);
			this.message_list.remove_row(g,this.env.display_next&&h==f.length-1)
			}
			this.env.display_next||this.message_list.clear_selection()
		}
		if(this.env.search_request)c+="&_search="+this.env.search_request;
	if(this.env.display_next&&this.env.next_uid)c+="&_next_uid="+this.env.next_uid;
	if(e<0)c+="&_count="+e*-1;else e>0&&this.delete_excessive_thread_rows();
	c+="&_uid="+this.uids_to_list(d);
	this.http_post(a,"_mbox="+urlencode(this.env.mailbox)+c,b)
	};

this.mark_message=function(a,
	b){
	var c=[],d=[],e=this.message_list?this.message_list.get_selection():[];
	if(b)c[0]=b;
	else if(this.env.uid)c[0]=this.env.uid;
	else if(this.message_list)for(b=0;b<e.length;b++)c[c.length]=e[b];
	if(this.message_list)for(b=0;b<c.length;b++){
		e=c[b];
		if(a=="read"&&this.message_list.rows[e].unread||a=="unread"&&!this.message_list.rows[e].unread||a=="delete"&&!this.message_list.rows[e].deleted||a=="undelete"&&this.message_list.rows[e].deleted||a=="flagged"&&!this.message_list.rows[e].flagged||a=="unflagged"&&
			this.message_list.rows[e].flagged)d[d.length]=e
			}else d=c;
	if(d.length||this.select_all_mode)switch(a){
		case "read":case "unread":
			this.toggle_read_status(a,d);
			break;
		case "delete":case "undelete":
			this.toggle_delete_status(d);
			break;
		case "flagged":case "unflagged":
			this.toggle_flagged_status(a,c);
			break
			}
		};

this.toggle_read_status=function(a,b){
	for(var c=0;c<b.length;c++)this.set_message(b[c],"unread",a=="unread"?true:false);
	this.http_post("mark","_uid="+this.uids_to_list(b)+"&_flag="+a);
	for(c=0;c<b.length;c++)this.update_thread_root(b[c],
		a)
	};

this.toggle_flagged_status=function(a,b){
	for(var c=0;c<b.length;c++)this.set_message(b[c],"flagged",a=="flagged"?true:false);
	this.http_post("mark","_uid="+this.uids_to_list(b)+"&_flag="+a)
	};

this.toggle_delete_status=function(a){
	var b=this.message_list?this.message_list.rows:[];
	if(a.length==1){
		!b.length||b[a[0]]&&!b[a[0]].deleted?this.flag_as_deleted(a):this.flag_as_undeleted(a);
		return true
		}
		for(var c=true,d,e=0;e<a.length;e++){
		d=a[e];
		if(b[d]&&!b[d].deleted){
			c=false;
			break
		}
	}
	c?this.flag_as_undeleted(a):
this.flag_as_deleted(a);
return true
};

this.flag_as_undeleted=function(a){
	for(var b=0;b<a.length;b++)this.set_message(a[b],"deleted",false);
	this.http_post("mark","_uid="+this.uids_to_list(a)+"&_flag=undelete");
	return true
	};

this.flag_as_deleted=function(a){
	var b="",c=[];
	b=this.message_list?this.message_list.rows:[];
	for(var d=0,e=0;e<a.length;e++){
		uid=a[e];
		if(b[uid]){
			if(b[uid].unread)c[c.length]=uid;
			if(this.env.skip_deleted){
				d+=this.update_thread(uid);
				this.message_list.remove_row(uid,this.env.display_next&&
					e==this.message_list.selection.length-1)
				}else this.set_message(uid,"deleted",true)
				}
			}
	if(this.env.skip_deleted&&this.message_list){
	this.env.display_next||this.message_list.clear_selection();
	d<0||d>0&&this.delete_excessive_thread_rows()
	}
	b="&_from="+(this.env.action?this.env.action:"");
if(c.length)b+="&_ruid="+this.uids_to_list(c);
if(this.env.skip_deleted){
	if(this.env.search_request)b+="&_search="+this.env.search_request;
	if(this.env.display_next&&this.env.next_uid)b+="&_next_uid="+this.env.next_uid
		}
		this.http_post("mark",
	"_uid="+this.uids_to_list(a)+"&_flag=delete"+b);
return true
};

this.flag_deleted_as_read=function(a){
	for(var b=this.message_list?this.message_list.rows:[],c=String(a).split(","),d=0;d<c.length;d++){
		a=c[d];
		b[a]&&this.set_message(a,"unread",false)
		}
	};

this.uids_to_list=function(a){
	return this.select_all_mode?"*":a.join(",")
	};

this.expunge_mailbox=function(a){
	var b=false,c="";
	if(a==this.env.mailbox){
		b=true;
		this.set_busy(true,"loading");
		c="&_reload=1"
		}
		this.http_post("expunge","_mbox="+urlencode(a)+c,b)
	};

this.purge_mailbox=
function(a){
	var b=false,c="";
	if(!confirm(this.get_label("purgefolderconfirm")))return false;
	if(a==this.env.mailbox){
		b=true;
		this.set_busy(true,"loading");
		c="&_reload=1"
		}
		this.http_post("purge","_mbox="+urlencode(a)+c,b);
	return true
	};

this.purge_mailbox_test=function(){
	return this.env.messagecount&&(this.env.mailbox==this.env.trash_mailbox||this.env.mailbox==this.env.junk_mailbox||this.env.mailbox.match("^"+RegExp.escape(this.env.trash_mailbox)+RegExp.escape(this.env.delimiter))||this.env.mailbox.match("^"+
		RegExp.escape(this.env.junk_mailbox)+RegExp.escape(this.env.delimiter)))
	};

this.login_user_keyup=function(a){
	var b=rcube_event.get_keycode(a),c=$("#rcmloginpwd");
	if(b==13&&c.length&&!c.val()){
		c.focus();
		return rcube_event.cancel(a)
		}
		return true
	};

this.init_messageform=function(){
	if(!this.gui_objects.messageform)return false;
	var a=$("[name='_from']"),b=$("[name='_to']"),c=$("input[name='_subject']"),d=$("[name='_message']").get(0),e=$("input[name='_is_html']").val()=="1";
	this.init_address_input_events(b);
	this.init_address_input_events($("[name='_cc']"));
	this.init_address_input_events($("[name='_bcc']"));
	if(!e){
		a.attr("type")=="select-one"&&$("input[name='_draft_saveid']").val()==""&&this.change_identity(a[0]);
		this.set_caret_pos(d,this.env.top_posting?0:$(d).val().length)
		}
		if(b.val()=="")b.focus();
	else if(c.val()=="")c.focus();else d&&!e&&d.focus();
	this.compose_field_hash(true);
	this.auto_save_start()
	};

this.removeTempDir=function(){
	console.log('yeah aja viva el rapppp');
	var checknum = window.parent.mailChecknum;
	window.parent.eyeos.callMessage(checknum, 'removeTempDir', [], function() {
	}, this);
};

this.init_address_input_events=function(a){
	a.bind(bw.safari||bw.ie?"keydown":"keypress",function(b){
		return j.ksearch_keypress(b,
			this)
		});
	a.attr("autocomplete","off")
	};

this.check_compose_input=function(){
	var a=$("[name='_to']"),b=$("[name='_cc']"),c=$("[name='_bcc']"),d=$("[name='_from']"),e=$("[name='_subject']"),f=$("[name='_message']");
	if(d.attr("type")=="text"&&!rcube_check_email(d.val(),true)){
		alert(this.get_label("nosenderwarning"));
		d.focus();
		return false
		}
		b=a.val()?a.val():b.val()?b.val():c.val();
	if(!rcube_check_email(b.replace(/^\s+/,"").replace(/[\s,;]+$/,""),true)){
		alert(this.get_label("norecipientwarning"));
		a.focus();
		return false
		}
		for(var g in this.env.attachments)if(typeof this.env.attachments[g]=="object"&&!this.env.attachments[g].complete){
		alert(this.get_label("notuploadedwarning"));
		return false
		}
		if(e.val()==""){
		a=prompt(this.get_label("nosubjectwarning"),this.get_label("nosubject"));
		if(!a&&a!==""){
			e.focus();
			return false
			}else e.val(a?a:this.get_label("nosubject"))
			}
			if((!window.tinyMCE||!tinyMCE.get(this.env.composebody))&&f.val()==""&&!confirm(this.get_label("nobodywarning"))){
		f.focus();
		return false
		}else if(window.tinyMCE&&
		tinyMCE.get(this.env.composebody)&&!tinyMCE.get(this.env.composebody).getContent()&&!confirm(this.get_label("nobodywarning"))){
		tinyMCE.get(this.env.composebody).focus();
		return false
		}
		this.stop_spellchecking();
	window.tinyMCE&&tinyMCE.get(this.env.composebody)&&tinyMCE.triggerSave();
	return true
	};

this.stop_spellchecking=function(){
	if(this.env.spellcheck&&!this.spellcheck_ready){
		$(this.env.spellcheck.spell_span).trigger("click");
		this.set_spellcheck_state("ready")
		}
	};

this.display_spellcheck_controls=function(a){
	if(this.env.spellcheck){
		a||
		this.stop_spellchecking();
		$(this.env.spellcheck.spell_container).css("visibility",a?"visible":"hidden")
		}
	};

this.set_spellcheck_state=function(a){
	this.spellcheck_ready=a=="ready"||a=="no_error_found";
	this.enable_command("spellcheck",this.spellcheck_ready)
	};

this.set_draft_id=function(a){
	$("input[name='_draft_saveid']").val(a)
	};

this.auto_save_start=function(){
	if(this.env.draft_autosave)this.save_timer=self.setTimeout(function(){
		j.command("savedraft")
		},this.env.draft_autosave*1E3);
	this.busy=false
	};

this.compose_field_hash=
function(a){
	var b=$("[name='_to']").val(),c=$("[name='_cc']").val(),d=$("[name='_bcc']").val(),e=$("[name='_subject']").val(),f="";
	if(b)f+=b+":";
	if(c)f+=c+":";
	if(d)f+=d+":";
	if(e)f+=e+":";
	b=tinyMCE.get(this.env.composebody);
	f+=b?b.getContent():$("[name='_message']").val();
	if(this.env.attachments)for(var g in this.env.attachments)f+=g;if(a)this.cmp_hash=f;
	return f
	};

this.change_identity=function(a,b){
	if(!a||!a.options)return false;
	if(!b)b=this.env.show_sig;
	a=a.options[a.selectedIndex].value;
	var c=$("[name='_message']"),
	d=c.val(),e=$("input[name='_is_html']").val()=="1",f=this.env.sig_above&&(this.env.compose_mode=="reply"||this.env.compose_mode=="forward")?"---":"-- ",g=-1;
	if(!this.env.identity)this.env.identity=a;
	this.env.signatures&&this.env.signatures[a]?this.enable_command("insert-sig",true):this.enable_command("insert-sig",false);
	if(e){
		if(b&&this.env.signatures){
			e=tinyMCE.get(this.env.composebody);
			b=e.dom.get("_rc_sig");
			if(!b){
				c=e.getBody();
				d=e.getDoc();
				b=d.createElement("div");
				b.setAttribute("id","_rc_sig");
				if(this.env.sig_above){
					e.getWin().focus();
					e=e.selection.getNode();
					if(e.nodeName=="BODY"){
						c.insertBefore(b,c.firstChild);
						c.insertBefore(d.createElement("br"),c.firstChild)
						}else{
						c.insertBefore(b,e.nextSibling);
						c.insertBefore(d.createElement("br"),e.nextSibling)
						}
					}else{
				bw.ie&&c.appendChild(d.createElement("br"));
				c.appendChild(b)
				}
			}
		if(this.env.signatures[a]){
		if(this.env.signatures[a].is_html){
			e=this.env.signatures[a].text;
			this.env.signatures[a].plain_text.match(/^--[ -]\r?\n/)||(e=f+"<br />"+e)
			}else{
			e=
			this.env.signatures[a].text;
			e.match(/^--[ -]\r?\n/)||(e=f+"\n"+e);
			e="<pre>"+e+"</pre>"
			}
			b.innerHTML=e
		}
	}
}else{
	if(b&&this.env.identity&&this.env.signatures&&this.env.signatures[this.env.identity]){
		e=this.env.signatures[this.env.identity].is_html?this.env.signatures[this.env.identity].plain_text:this.env.signatures[this.env.identity].text;
		e=e.replace(/\r\n/,"\n");
		e.match(/^--[ -]\n/)||(e=f+"\n"+e);
		g=this.env.sig_above?d.indexOf(e):d.lastIndexOf(e);
		if(g>=0)d=d.substring(0,g)+d.substring(g+e.length,d.length)
			}
			if(b&&
		this.env.signatures&&this.env.signatures[a]){
		e=this.env.signatures[a].is_html?this.env.signatures[a].plain_text:this.env.signatures[a].text;
		e=e.replace(/\r\n/,"\n");
		e.match(/^--[ -]\n/)||(e=f+"\n"+e);
		if(this.env.sig_above)if(g>=0){
			d=d.substring(0,g)+e+d.substring(g,d.length);
			f=g-1
			}else if(pos=this.get_caret_pos(c.get(0))){
			d=d.substring(0,pos)+"\n"+e+"\n\n"+d.substring(pos,d.length);
			f=pos
			}else{
			f=0;
			d="\n\n"+e+"\n\n"+d.replace(/^[\r\n]+/,"")
			}else{
			d=d.replace(/[\r\n]+$/,"");
			f=!this.env.top_posting&&d.length?
			d.length+1:0;
			d+="\n\n"+e
			}
		}else f=this.env.top_posting?0:d.length;
c.val(d);
this.set_caret_pos(c.get(0),f)
}
this.env.identity=a;
return true
};

this.show_fileChooser_eyeos = function(b) {
	b._ocult.defaultValue = '';
	b._attachments.defaultValue = '';
	var checknum = window.parent.mailChecknum;
	var fc = new window.parent.eyeos.dialogs.FileChooser(checknum);
	fc.showOpenDialog(window.parent, function(choice, path) {
		if (choice == window.parent.eyeos.dialogs.FileChooser.APPROVE_OPTION) {
			this.show_attachment_form(true);
			b._ocult.defaultValue = path;
			window.parent.eyeos.callMessage(checknum, 'getFilenameFromPath', path, function(result) {
				if(!result) {
					b._attachments.defaultValue = '';
				} else {
					b._attachments.defaultValue = result;
				}
			}, this);
		} else {
			fc.close();
		}
	}, this);
};

this.build_attachments_list = function(form) {
	var checknum = window.parent.mailChecknum;
	window.parent.eyeos.callMessage(checknum, 'copyFileTempDir', form._ocult.defaultValue, function(result) {
		if(!result) {
			form._attachments.defaultValue = '';
		} else {
			form._attachments.defaultValue = result;
		}
	}, this);
	if(form._attachments.value != ''){

		var rannum = 0;
		var trobat = true;
		while(trobat) {
			trobat = false;
			rannum = Math.round(Math.random()*100);
			if(document.getElementById(rannum)) {
				trobat = true;
			}
		}

		//var filename = path.substring(pos+1);
		if(document.all){
			document.body.insertAdjacentHTML("BeforeEnd",'<iframe name="'+ rannum +'" src="program/blank.gif" style="width:0;height:0;visibility:hidden;"></iframe>');
		} else{
			var d=document.createElement("iframe");
			d.name=rannum;
			d.style.border="none";
			d.style.width=0;
			d.style.height=0;
			d.style.visibility="hidden";
			document.body.appendChild(d);
		}
		form.target=rannum;
		form.action=this.env.comm_path+"&_action=upload&_uploadpath="+form._attachments.defaultValue+"&_id="+rannum;
		form.setAttribute("enctype","multipart/form-data");
		form.submit();
		this.show_attachment_form(false);
		this.gui_objects.attachmentform=form;
		this.gui_objects.attachmentform._attachments.defaultValue = '';
		this.gui_objects.attachmentform._ocult.defaultValue = '';
		return true
	}
};

this.show_attachment_form=function(a){
	if(!this.gui_objects.uploadbox)return false;
	var b,c;
	if(b=this.gui_objects.uploadbox){
		if(a&&(c=this.gui_objects.attachmentlist)){
			var d=$(c).offset();
			b.style.top=d.top+c.offsetHeight+10+"px";
			b.style.left=d.left+"px"
			}
			$(b).toggle()
		}
		try{
		!a&&this.gui_objects.attachmentform!=this.gui_objects.messageform&&this.gui_objects.attachmentform.reset()
		this.gui_objects.attachmentform._attachments.defaultValue = '';
		this.gui_objects.attachmentform._ocult.defaultValue = '';
		}catch(e){
		}
	return true
	};

this.upload_file=function(a){
	if(!a)return false;
	for(var b=false,c=0;c<a.elements.length;c++)if(a.elements[c].type=="file"&&a.elements[c].value){
		b=true;
		break
	}
	if(b){
		b=(new Date).getTime();
		c="rcmupload"+b;
		if(document.all)document.body.insertAdjacentHTML("BeforeEnd",'<iframe name="'+c+'" src="program/blank.gif" style="width:0;height:0;visibility:hidden;"></iframe>');
		else{
			var d=document.createElement("iframe");
			d.name=c;
			d.style.border="none";
			d.style.width=0;
			d.style.height=0;
			d.style.visibility="hidden";
			document.body.appendChild(d)
			}
			d=document.getElementsByName(c)[0];
		$(d).bind("load",{
			ts:b
		},function(e){
			var f="";
			try{
				if(this.contentDocument)var g=this.contentDocument;
				else if(this.contentWindow)g=this.contentWindow.document;
				f=g.childNodes[0].innerHTML
				}catch(h){}
			if(!String(f).match(/add2attachment/)&&(!bw.opera||rcmail.env.uploadframe&&rcmail.env.uploadframe==e.data.ts)){
				rcmail.display_message(rcmail.get_label("fileuploaderror"),"error");
				rcmail.remove_from_attachment_list(e.data.ts)
				}
				if(bw.opera)rcmail.env.uploadframe=
				e.data.ts
				});
		a.target=c;
		a.action=this.env.comm_path+"&_action=upload&_uploadid="+b;
		a.setAttribute("enctype","multipart/form-data");
		a.submit();
		this.show_attachment_form(false);
		d=this.get_label("uploading");
		if(this.env.loadingicon)d='<img src="'+this.env.loadingicon+'" alt="" />'+d;
		if(this.env.cancelicon)d='<a title="'+this.get_label("cancel")+'" onclick="return rcmail.cancel_attachment_upload(\''+b+"', '"+c+'\');" href="#cancelupload"><img src="'+this.env.cancelicon+'" alt="" /></a>'+d;
		this.add2attachment_list(b,

		{
			name:"",
			html:d,
			complete:false
		})
		}
		this.gui_objects.attachmentform=a;
	return true
	};

this.add2attachment_list=function(a,b,c){
	if(!this.gui_objects.attachmentlist)return false;
	var d=$("<li>").attr("id",a).html(b.html),e;
	c&&(e=document.getElementById(c))?d.replaceAll(e):d.appendTo(this.gui_objects.attachmentlist);
	c&&this.env.attachments[c]&&delete this.env.attachments[c];
	this.env.attachments[a]=b;
	return true
	};

this.remove_from_attachment_list=function(a){
	this.env.attachments[a]&&delete this.env.attachments[a];
	if(!this.gui_objects.attachmentlist)return false;
	var b=this.gui_objects.attachmentlist.getElementsByTagName("li");
	for(i=0;i<b.length;i++)b[i].id==a&&this.gui_objects.attachmentlist.removeChild(b[i])
		};

this.remove_attachment=function(a){
	a&&this.env.attachments[a]&&this.http_post("remove-attachment","_file="+urlencode(a));
	return true
	};

this.cancel_attachment_upload=function(a,b){
	if(!a||!b)return false;
	this.remove_from_attachment_list(a);
	$("iframe[name='"+b+"']").remove();
	return false
	};

this.add_contact=
function(a){
	a&&this.http_post("addcontact","_address="+a);
	return true
	};

this.qsearch=function(a){
	if(a!=""){
		var b="";
		if(this.message_list){
			this.message_list.clear();
			if(this.env.search_mods){
				var c=this.env.search_mods[this.env.mailbox]?this.env.search_mods[this.env.mailbox]:this.env.search_mods["*"];
				if(c){
					var d=[];
					for(var e in c)d.push(e);b+="&_headers="+d.join(",")
					}
				}
		}else if(this.contact_list){
	this.contact_list.clear(true);
	this.show_contentframe(false)
	}
	if(this.gui_objects.search_filter)b+="&_filter="+
	this.gui_objects.search_filter.value;
this.env.current_page=1;
this.set_busy(true,"searching");
this.http_request("search","_q="+urlencode(a)+(this.env.mailbox?"&_mbox="+urlencode(this.env.mailbox):"")+(this.env.source?"&_source="+urlencode(this.env.source):"")+(this.env.group?"&_gid="+urlencode(this.env.group):"")+(b?b:""),true)
}
return true
};

this.reset_qsearch=function(){
	if(this.gui_objects.qsearchbox)this.gui_objects.qsearchbox.value="";
	this.env.search_request=null;
	return true
	};

this.sent_successfully=
function(a,b){
	this.list_mailbox();
	this.display_message(b,a,true)
	};

this.ksearch_keypress=function(a,b){
	this.ksearch_timer&&clearTimeout(this.ksearch_timer);
	var c=rcube_event.get_keycode(a),d=rcube_event.get_modifier(a);
	switch(c){
		case 38:case 40:
			if(!this.ksearch_pane)break;
			c=c==38?1:0;
			b=document.getElementById("rcmksearchSelected");
			if(!b)b=this.ksearch_pane.__ul.firstChild;
			if(b)this.ksearch_select(c?b.previousSibling:b.nextSibling);
			return rcube_event.cancel(a);
		case 9:
			if(d==SHIFT_KEY)break;case 13:
			if(this.ksearch_selected===
			null||!this.ksearch_input||!this.ksearch_value)break;
			this.insert_recipient(this.ksearch_selected);
			this.ksearch_hide();
			return rcube_event.cancel(a);
		case 27:
			this.ksearch_hide();
			break;
		case 37:case 39:
			if(d!=SHIFT_KEY)return
			}
			this.ksearch_timer=window.setTimeout(function(){
		j.ksearch_get_results()
		},200);
	this.ksearch_input=b;
	return true
	};

this.ksearch_select=function(a){
	var b=$("#rcmksearchSelected");
	b[0]&&a&&b.removeAttr("id").removeClass("selected");
	if(a){
		$(a).attr("id","rcmksearchSelected").addClass("selected");
		this.ksearch_selected=a._rcm_id
		}
	};

this.insert_recipient=function(a){
	if(this.env.contacts[a]&&this.ksearch_input){
		var b=this.ksearch_input.value,c=this.get_caret_pos(this.ksearch_input);
		b=b.lastIndexOf(this.ksearch_value,c);
		c=this.ksearch_input.value.substring(0,b);
		var d=this.ksearch_input.value.substring(b+this.ksearch_value.length,this.ksearch_input.value.length),e="";
		if(typeof this.env.contacts[a]=="object"&&this.env.contacts[a].id){
			e+=this.env.contacts[a].name+", ";
			this.group2expand=$.extend({},
				this.env.contacts[a]);
			this.group2expand.input=this.ksearch_input;
			this.http_request("group-expand","_source="+urlencode(this.env.contacts[a].source)+"&_gid="+urlencode(this.env.contacts[a].id),false)
			}else if(typeof this.env.contacts[a]=="string")e=this.env.contacts[a]+", ";
		this.ksearch_input.value=c+e+d;
		c=b+e.length;
		this.ksearch_input.setSelectionRange&&this.ksearch_input.setSelectionRange(c,c)
		}
	};

this.replace_group_recipients=function(a,b){
	if(this.group2expand&&this.group2expand.id==a){
		this.group2expand.input.value=
		this.group2expand.input.value.replace(this.group2expand.name,b);
		this.group2expand=null
		}
	};

this.ksearch_get_results=function(){
	var a=this.ksearch_input?this.ksearch_input.value:null;
	if(a!==null){
		this.ksearch_pane&&this.ksearch_pane.is(":visible")&&this.ksearch_pane.hide();
		var b=this.get_caret_pos(this.ksearch_input),c=a.lastIndexOf(",",b-1);
		a=a.substring(c+1,b);
		a=a.replace(/(^\s+|\s+$)/g,"");
		if(a!=this.ksearch_value){
			b=this.ksearch_value;
			this.ksearch_value=a;
			if(a.length)if(!(b&&b.length&&this.env.contacts&&
				!this.env.contacts.length&&a.indexOf(b)==0)){
				this.display_message(this.get_label("searching"),"loading",false);
				this.http_post("autocomplete","_search="+urlencode(a))
				}
			}
		}
};

this.ksearch_query_results=function(a,b){
	if(!(this.ksearch_value&&b!=this.ksearch_value)){
		this.hide_message();
		this.env.contacts=a?a:[];
		this.ksearch_display_results(this.env.contacts)
		}
	};

this.ksearch_display_results=function(a){
	if(a.length&&this.ksearch_input&&this.ksearch_value){
		var b,c,d,e=this.ksearch_value;
		if(!this.ksearch_pane){
			b=
			$("<ul>");
			this.ksearch_pane=$("<div>").attr("id","rcmKSearchpane").css({
				position:"absolute",
				"z-index":3E4
			}).append(b).appendTo(document.body);
			this.ksearch_pane.__ul=b[0]
			}
			b=this.ksearch_pane.__ul;
		b.innerHTML="";
		for(i=0;i<a.length;i++){
			d=typeof a[i]=="object"?a[i].name:a[i];
			c=document.createElement("LI");
			c.innerHTML=d.replace(new RegExp("("+e+")","ig"),"##$1%%").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/##([^%]+)%%/g,"<b>$1</b>");
			c.onmouseover=function(){
				j.ksearch_select(this)
				};

			c.onmouseup=
			function(){
				j.ksearch_click(this)
				};

			c._rcm_id=i;
			b.appendChild(c)
			}
			$(b.firstChild).attr("id","rcmksearchSelected").addClass("selected");
		this.ksearch_selected=0;
		a=$(this.ksearch_input).offset();
		this.ksearch_pane.css({
			left:a.left+"px",
			top:a.top+this.ksearch_input.offsetHeight+"px"
			}).show()
		}else this.ksearch_hide()
		};

this.ksearch_click=function(a){
	this.ksearch_input&&this.ksearch_input.focus();
	this.insert_recipient(a._rcm_id);
	this.ksearch_hide()
	};

this.ksearch_blur=function(){
	this.ksearch_timer&&clearTimeout(this.ksearch_timer);
	this.ksearch_value="";
	this.ksearch_input=null;
	this.ksearch_hide()
	};

this.ksearch_hide=function(){
	this.ksearch_selected=null;
	this.ksearch_pane&&this.ksearch_pane.hide()
	};

this.contactlist_keypress=function(a){
	a.key_pressed==a.DELETE_KEY&&this.command("delete")
	};

this.contactlist_select=function(a){
	this.preview_timer&&clearTimeout(this.preview_timer);
	var b,c=this;
	if(b=a.get_single_selection())this.preview_timer=window.setTimeout(function(){
		c.load_contact(b,"show")
		},200);else this.env.contentframe&&this.show_contentframe(false);
	this.enable_command("compose",a.selection.length>0);
	this.enable_command("edit",b&&this.env.address_sources&&!this.env.address_sources[this.env.source].readonly?true:false);
	this.enable_command("delete",a.selection.length&&this.env.address_sources&&!this.env.address_sources[this.env.source].readonly);
	return false
	};

this.list_contacts=function(a,b,c){
	var d="",e=window;
	if(b)a=0;
	else if(!a)a=this.env.source;
	if(c&&this.current_page==c&&a==this.env.source&&b==this.env.group)return false;
	if(a!=this.env.source){
		c=
		1;
		this.env.current_page=c;
		this.reset_qsearch()
		}else if(b!=this.env.group)c=this.env.current_page=1;
	this.select_folder(b?"G"+b:a,this.env.group?"G"+this.env.group:this.env.source);
	this.env.source=a;
	this.env.group=b;
	if(this.gui_objects.contactslist)this.list_contacts_remote(a,b,c);
	else{
		if(this.env.contentframe&&window.frames&&window.frames[this.env.contentframe]){
			e=window.frames[this.env.contentframe];
			d="&_framed=1"
			}
			if(b)d+="&_gid="+b;
		if(c)d+="&_page="+c;
		if(this.env.search_request)d+="&_search="+this.env.search_request;
		this.set_busy(true,"loading");
		e.location.href=this.env.comm_path+(a?"&_source="+urlencode(a):"")+d
		}
	};

this.list_contacts_remote=function(a,b,c){
	this.contact_list.clear(true);
	this.show_contentframe(false);
	this.enable_command("delete","compose",false);
	c=(a?"_source="+urlencode(a):"")+(c?(a?"&":"")+"_page="+c:"");
	this.env.source=a;
	if(this.env.group=b)c+="&_gid="+b;
	if(this.env.search_request)c+="&_search="+this.env.search_request;
	this.set_busy(true,"loading");
	this.http_request("list",c,true)
	};

this.load_contact=
function(a,b,c){
	var d="",e=window;
	if(this.env.contentframe&&window.frames&&window.frames[this.env.contentframe]){
		d="&_framed=1";
		e=window.frames[this.env.contentframe];
		this.show_contentframe(true)
		}else if(c)return false;
	if(b&&(a||b=="add")&&!this.drag_active){
		if(this.env.group)d+="&_gid="+urlencode(this.env.group);
		this.set_busy(true);
		e.location.href=this.env.comm_path+"&_action="+b+"&_source="+urlencode(this.env.source)+"&_cid="+urlencode(a)+d
		}
		return true
	};

this.copy_contact=function(a,b){
	a||(a=this.contact_list.get_selection().join(","));
	if(b.type=="group")this.http_post("group-addmembers","_cid="+urlencode(a)+"&_source="+urlencode(this.env.source)+"&_gid="+urlencode(b.id));else b.id!=this.env.source&&a&&this.env.address_sources[b.id]&&!this.env.address_sources[b.id].readonly&&this.http_post("copy","_cid="+urlencode(a)+"&_source="+urlencode(this.env.source)+"&_to="+urlencode(b.id))
		};

this.delete_contacts=function(){
	var a=this.contact_list.get_selection();
	if(!(!(a.length||this.env.cid)||!this.env.group&&!confirm(this.get_label("deletecontactconfirm")))){
		var b=
		[],c="";
		if(this.env.cid)b[b.length]=this.env.cid;
		else{
			for(var d,e=0;e<a.length;e++){
				d=a[e];
				b[b.length]=d;
				this.contact_list.remove_row(d,e==a.length-1)
				}
				a.length==1&&this.show_contentframe(false)
			}
			if(this.env.search_request)c+="&_search="+this.env.search_request;
		this.env.group?this.http_post("group-delmembers","_cid="+urlencode(b.join(","))+"&_source="+urlencode(this.env.source)+"&_gid="+urlencode(this.env.group)+c):this.http_post("delete","_cid="+urlencode(b.join(","))+"&_source="+urlencode(this.env.source)+
			"&_from="+(this.env.action?this.env.action:"")+c);
		return true
		}
	};

this.update_contact_row=function(a,b,c){
	var d;
	if(this.contact_list.rows[a]&&(d=this.contact_list.rows[a].obj)){
		for(var e=0;e<b.length;e++)d.cells[e]&&$(d.cells[e]).html(b[e]);
		if(c){
			d.id="rcmrow"+c;
			this.contact_list.remove_row(a);
			this.contact_list.init_row(d);
			this.contact_list.selection[0]=c;
			ow.style.display=""
			}
			return true
		}
		return false
	};

this.add_contact_row=function(a,b){
	if(!this.gui_objects.contactslist||!this.gui_objects.contactslist.tBodies[0])return false;
	var c=this.gui_objects.contactslist.tBodies[0].rows.length%2,d=document.createElement("tr");
	d.id="rcmrow"+a;
	d.className="contact "+(c?"even":"odd");
	if(this.contact_list.in_selection(a))d.className+=" selected";
	for(var e in b){
		col=document.createElement("td");
		col.className=String(e).toLowerCase();
		col.innerHTML=b[e];
		d.appendChild(col)
		}
		this.contact_list.insert_row(d);
	this.enable_command("export",this.contact_list.rowcount>0)
	};

this.add_contact_group=function(){
	if(this.gui_objects.folderlist&&this.env.address_sources[this.env.source].groups){
		if(!this.name_input){
			this.name_input=
			document.createElement("input");
			this.name_input.type="text";
			this.name_input.onkeypress=function(a){
				return rcmail.add_input_keypress(a)
				};

			this.gui_objects.folderlist.parentNode.appendChild(this.name_input)
			}
			this.name_input.select()
		}
	};

this.rename_contact_group=function(){
	if(this.env.group&&this.gui_objects.folderlist){
		if(!this.name_input){
			this.enable_command("list","listgroup",false);
			this.name_input=document.createElement("input");
			this.name_input.type="text";
			this.name_input.value=this.env.contactgroups["G"+
			this.env.group].name;
			this.name_input.onkeypress=function(c){
				return rcmail.add_input_keypress(c)
				};

			this.env.group_renaming=true;
			var a,b=this.get_folder_li(this.env.group,"rcmliG");
			if(b&&(a=b.firstChild)){
				$(a).hide();
				b.insertBefore(this.name_input,a)
				}
			}
		this.name_input.select()
	}
};

this.delete_contact_group=function(){
	this.env.group&&this.http_post("group-delete","_source="+urlencode(this.env.source)+"&_gid="+urlencode(this.env.group),true)
	};

this.remove_group_item=function(a){
	var b,c="G"+a;
	if(b=this.get_folder_li(c)){
		this.triggerEvent("removegroup",

		{
			id:a,
			li:b
		});
		b.parentNode.removeChild(b);
		delete this.env.contactfolders[c];
		delete this.env.contactgroups[c]
	}
	this.list_contacts(null,0)
	};

this.add_input_keypress=function(a){
	a=rcube_event.get_keycode(a);
	if(a==13){
		if(a=this.name_input.value){
			this.set_busy(true,"loading");
			this.env.group_renaming?this.http_post("group-rename","_source="+urlencode(this.env.source)+"&_gid="+urlencode(this.env.group)+"&_name="+urlencode(a),true):this.http_post("group-create","_source="+urlencode(this.env.source)+"&_name="+
				urlencode(a),true)
			}
			return false
		}else a==27&&this.reset_add_input();
	return true
	};

this.reset_add_input=function(){
	if(this.name_input){
		if(this.env.group_renaming){
			$(this.name_input.parentNode.lastChild).show();
			this.env.group_renaming=false
			}
			this.name_input.parentNode.removeChild(this.name_input);
		this.name_input=null
		}
		this.enable_command("list","listgroup",true)
	};

this.insert_contact_group=function(a){
	this.reset_add_input();
	a.type="group";
	var b="G"+a.id;
	this.env.contactfolders[b]=this.env.contactgroups[b]=
	a;
	var c=$("<a>").attr("href","#").bind("click",function(){
		return rcmail.command("listgroup",a.id,this)
		}).html(a.name);
	b=$("<li>").attr("id","rcmli"+b).addClass("contactgroup").append(c);
	$(this.gui_objects.folderlist).append(b);
	this.triggerEvent("insertgroup",{
		id:a.id,
		name:a.name,
		li:b[0]
		})
	};

this.update_contact_group=function(a,b){
	this.reset_add_input();
	var c="G"+a,d,e=this.get_folder_li(c);
	if(e&&(d=e.firstChild)&&d.tagName.toLowerCase()=="a")d.innerHTML=b;
	this.env.contactfolders[c].name=this.env.contactgroups[c].name=
	b;
	this.triggerEvent("updategroup",{
		id:a,
		name:b,
		li:e[0]
		})
	};

this.init_subscription_list=function(){
	var a=this;
	this.subscription_list=new rcube_list_widget(this.gui_objects.subscriptionlist,{
		multiselect:false,
		draggable:true,
		keyboard:false,
		toggleselect:true
	});
	this.subscription_list.addEventListener("select",function(b){
		a.subscription_select(b)
		});
	this.subscription_list.addEventListener("dragstart",function(){
		a.drag_active=true
		});
	this.subscription_list.addEventListener("dragend",function(b){
		a.subscription_move_folder(b)
		});
	this.subscription_list.row_init=function(b){
		var c=b.obj.getElementsByTagName("a");
		if(c[0])c[0].onclick=function(){
			a.rename_folder(b.id);
			return false
			};

		if(c[1])c[1].onclick=function(){
			a.delete_folder(b.id);
			return false
			};

		b.obj.onmouseover=function(){
			a.focus_subscription(b.id)
			};

		b.obj.onmouseout=function(){
			a.unfocus_subscription(b.id)
			}
		};

this.subscription_list.init()
};

this.section_select=function(a){
	if(a=a.get_single_selection()){
		var b="",c=window;
		this.set_busy(true);
		if(this.env.contentframe&&window.frames&&
			window.frames[this.env.contentframe]){
			b="&_framed=1";
			c=window.frames[this.env.contentframe]
			}
			c.location.href=this.env.comm_path+"&_action=edit-prefs&_section="+a+b
		}
		return true
	};

this.identity_select=function(a){
	if(a=a.get_single_selection())this.load_identity(a,"edit-identity")
		};

this.load_identity=function(a,b){
	if(b=="edit-identity"&&(!a||a==this.env.iid))return false;
	var c="",d=window;
	if(this.env.contentframe&&window.frames&&window.frames[this.env.contentframe]){
		c="&_framed=1";
		d=window.frames[this.env.contentframe];
		document.getElementById(this.env.contentframe).style.visibility="inherit"
		}
		if(b&&(a||b=="add-identity")){
		this.set_busy(true);
		d.location.href=this.env.comm_path+"&_action="+b+"&_iid="+a+c
		}
		return true
	};

this.delete_identity=function(a){
	var b=this.identity_list.get_selection();
	if(b.length||this.env.iid){
		a||(a=this.env.iid?this.env.iid:b[0]);
		this.goto_url("delete-identity","_iid="+a+"&_token="+this.env.request_token,true);
		return true
		}
	};

this.focus_subscription=function(a){
	var b,c,d=RegExp("["+RegExp.escape(this.env.delimiter)+
		"]?[^"+RegExp.escape(this.env.delimiter)+"]+$");
	if(this.drag_active&&this.env.folder&&(b=document.getElementById(a)))if(this.env.subscriptionrows[a]&&(c=this.env.subscriptionrows[a][0])){
		if(this.check_droptarget(c)&&!this.env.subscriptionrows[this.get_folder_row_id(this.env.folder)][2]&&c!=this.env.folder.replace(d,"")&&!c.match(new RegExp("^"+RegExp.escape(this.env.folder+this.env.delimiter)))){
			this.set_env("dstfolder",c);
			$(b).addClass("droptarget")
			}
		}else if(this.env.folder.match(new RegExp(RegExp.escape(this.env.delimiter)))){
		this.set_env("dstfolder",
			this.env.delimiter);
		$(this.subscription_list.frame).addClass("droptarget")
		}
	};

this.unfocus_subscription=function(a){
	var b=$("#"+a);
	this.set_env("dstfolder",null);
	this.env.subscriptionrows[a]&&b[0]?b.removeClass("droptarget"):$(this.subscription_list.frame).removeClass("droptarget")
	};

this.subscription_select=function(a){
	var b,c;
	(b=a.get_single_selection())&&this.env.subscriptionrows["rcmrow"+b]&&(c=this.env.subscriptionrows["rcmrow"+b][0])?this.set_env("folder",c):this.set_env("folder",null);
	if(this.gui_objects.createfolderhint)$(this.gui_objects.createfolderhint).html(this.env.folder?
		this.get_label("addsubfolderhint"):"")
	};

this.subscription_move_folder=function(){
	var a=RegExp("["+RegExp.escape(this.env.delimiter)+"]?[^"+RegExp.escape(this.env.delimiter)+"]+$");
	if(this.env.folder&&this.env.dstfolder&&this.env.dstfolder!=this.env.folder&&this.env.dstfolder!=this.env.folder.replace(a,"")){
		a=new RegExp("[^"+RegExp.escape(this.env.delimiter)+"]*["+RegExp.escape(this.env.delimiter)+"]","g");
		a=this.env.folder.replace(a,"");
		a=this.env.dstfolder==this.env.delimiter?a:this.env.dstfolder+
		this.env.delimiter+a;
		this.set_busy(true,"foldermoving");
		this.http_post("rename-folder","_folder_oldname="+urlencode(this.env.folder)+"&_folder_newname="+urlencode(a),true)
		}
		this.drag_active=false;
	this.unfocus_subscription(this.get_folder_row_id(this.env.dstfolder))
	};

this.create_folder=function(a){
	this.edit_folder&&this.reset_folder_rename();
	var b;
	if((b=this.gui_objects.editform)&&b.elements._folder_name){
		a=b.elements._folder_name.value;
		if(a.indexOf(this.env.delimiter)>=0){
			alert(this.get_label("forbiddencharacter")+
				" ("+this.env.delimiter+")");
			return false
			}
			if(this.env.folder&&a!="")a=this.env.folder+this.env.delimiter+a;
		this.set_busy(true,"foldercreating");
		this.http_post("create-folder","_name="+urlencode(a),true)
		}else b.elements._folder_name&&b.elements._folder_name.focus()
		};

this.rename_folder=function(a){
	var b,c;
	if(b=this.edit_folder){
		this.reset_folder_rename();
		if(b==a)return
	}
	if(a&&this.env.subscriptionrows[a]&&(c=document.getElementById(a))){
		b=new RegExp(".*["+RegExp.escape(this.env.delimiter)+"]");
		this.name_input=
		document.createElement("input");
		this.name_input.type="text";
		this.name_input.value=this.env.subscriptionrows[a][0].replace(b,"");
		b=new RegExp("["+RegExp.escape(this.env.delimiter)+"]?[^"+RegExp.escape(this.env.delimiter)+"]+$");
		this.name_input.__parent=this.env.subscriptionrows[a][0].replace(b,"");
		this.name_input.onkeypress=function(d){
			rcmail.name_input_keypress(d)
			};

		c.cells[0].replaceChild(this.name_input,c.cells[0].firstChild);
		this.edit_folder=a;
		this.name_input.select();
		if(a=this.gui_objects.editform)a.onsubmit=
			function(){
				return false
				}
			}
	};

this.reset_folder_rename=function(){
	var a=this.name_input?this.name_input.parentNode:null;
	a&&this.edit_folder&&this.env.subscriptionrows[this.edit_folder]&&$(a).html(this.env.subscriptionrows[this.edit_folder][1]);
	this.edit_folder=null
	};

this.name_input_keypress=function(a){
	a=rcube_event.get_keycode(a);
	if(a==13){
		a=this.name_input?this.name_input.value:null;
		if(this.edit_folder&&a){
			if(a.indexOf(this.env.delimiter)>=0){
				alert(this.get_label("forbiddencharacter")+" ("+this.env.delimiter+
					")");
				return false
				}
				if(this.name_input.__parent)a=this.name_input.__parent+this.env.delimiter+a;
			this.set_busy(true,"folderrenaming");
			this.http_post("rename-folder","_folder_oldname="+urlencode(this.env.subscriptionrows[this.edit_folder][0])+"&_folder_newname="+urlencode(a),true)
			}
		}else a==27&&this.reset_folder_rename()
	};

this.delete_folder=function(a){
	a=this.env.subscriptionrows[a][0];
	this.edit_folder&&this.reset_folder_rename();
	if(a&&confirm(this.get_label("deletefolderconfirm"))){
		this.set_busy(true,
			"folderdeleting");
		this.http_post("delete-folder","_mboxes="+urlencode(a),true);
		this.set_env("folder",null);
		$(this.gui_objects.createfolderhint).html("")
		}
	};

this.add_folder_row=function(a,b,c,d){
	if(!this.gui_objects.subscriptionlist)return false;
	var e;
	for(var f in this.env.subscriptionrows)if(this.env.subscriptionrows[f]!=null&&!this.env.subscriptionrows[f][2]){
		e=f;
		break
	}
	var g,h;
	f=this.gui_objects.subscriptionlist.tBodies[0];
	var k="rcmrow"+(f.childNodes.length+1),l=this.subscription_list.get_single_selection();
	if(c&&c.id)e=k=c.id;
	if(!k||!e||!(g=document.getElementById(e))){
		this.goto_url("folders");
		return false
		}else{
		e=this.clone_table_row(g);
		e.id=k;
		d&&(d=this.get_folder_row_id(d))?f.insertBefore(e,document.getElementById(d)):f.appendChild(e);
		c&&f.removeChild(c)
		}
		this.env.subscriptionrows[e.id]=[a,b,0];
	e.cells[0].innerHTML=b;
	if(!c)e.cells[1].innerHTML="*";
	if(!c&&e.cells[2]&&e.cells[2].firstChild.tagName.toLowerCase()=="input"){
		e.cells[2].firstChild.value=a;
		e.cells[2].firstChild.checked=true
		}
		if(!c&&(h=this.gui_objects.editform)){
		if(h.elements._folder_oldname)h.elements._folder_oldname.options[h.elements._folder_oldname.options.length]=
			new Option(a,a);
		if(h.elements._folder_name)h.elements._folder_name.value=""
			}
			this.init_subscription_list();
	l&&document.getElementById("rcmrow"+l)&&this.subscription_list.select_row(l);
	document.getElementById(k).scrollIntoView&&document.getElementById(k).scrollIntoView()
	};

this.replace_folder_row=function(a,b,c,d){
	var e,f,g=this.get_folder_row_id(a);
	g=document.getElementById(g);
	this.add_folder_row(b,c,g,d);
	if((e=this.gui_objects.editform)&&(f=e.elements._folder_oldname)){
		for(d=0;d<f.options.length;d++)if(f.options[d].value==
			a){
			f.options[d].text=c;
			f.options[d].value=b;
			break
		}
		e.elements._folder_newname.value=""
		}
	};

this.remove_folder_row=function(a){
	var b,c,d,e=this.get_folder_row_id(a);
	if(e&&(d=document.getElementById(e)))d.style.display="none";
	if((b=this.gui_objects.editform)&&(c=b.elements._folder_oldname))for(d=0;d<c.options.length;d++)if(c.options[d].value==a){
		c.options[d]=null;
		break
	}
	if(b&&b.elements._folder_newname)b.elements._folder_newname.value=""
		};

this.subscribe_folder=function(a){
	a&&this.http_post("subscribe",
		"_mbox="+urlencode(a))
	};

this.unsubscribe_folder=function(a){
	a&&this.http_post("unsubscribe","_mbox="+urlencode(a))
	};

this.enable_threading=function(a){
	a&&this.http_post("enable-threading","_mbox="+urlencode(a))
	};

this.disable_threading=function(a){
	a&&this.http_post("disable-threading","_mbox="+urlencode(a))
	};

this.get_folder_row_id=function(a){
	for(var b in this.env.subscriptionrows)if(this.env.subscriptionrows[b]&&this.env.subscriptionrows[b][0]==a)break;return b
	};

this.clone_table_row=function(a){
	for(var b,
		c,d=document.createElement("tr"),e=0;e<a.cells.length;e++){
		b=a.cells[e];
		c=document.createElement("td");
		if(b.className)c.className=b.className;
		b.align&&c.setAttribute("align",b.align);
		c.innerHTML=b.innerHTML;
		d.appendChild(c)
		}
		return d
	};

this.set_page_buttons=function(){
	this.enable_command("nextpage",this.env.pagecount>this.env.current_page);
	this.enable_command("lastpage",this.env.pagecount>this.env.current_page);
	this.enable_command("previouspage",this.env.current_page>1);
	this.enable_command("firstpage",
		this.env.current_page>1)
	};

this.init_buttons=function(){
	for(var a in this.buttons)if(typeof a=="string")for(var b=0;b<this.buttons[a].length;b++){
		var c=this.buttons[a][b],d=document.getElementById(c.id);
		if(d){
			var e=false;
			if(c.type=="image"){
				d=d.parentNode;
				e=true
				}
				d._command=a;
			d._id=c.id;
			if(c.sel){
				d.onmousedown=function(){
					return rcmail.button_sel(this._command,this._id)
					};

				d.onmouseup=function(){
					return rcmail.button_out(this._command,this._id)
					};

				if(e)(new Image).src=c.sel
					}
					if(c.over){
				d.onmouseover=function(){
					return rcmail.button_over(this._command,
						this._id)
					};

				d.onmouseout=function(){
					return rcmail.button_out(this._command,this._id)
					};

				if(e)(new Image).src=c.over
					}
				}
	}
	};

this.set_button=function(a,b){
	var c,d=this.buttons[a];
	if(!d||!d.length)return false;
	for(var e=0;e<d.length;e++){
		a=d[e];
		if((c=document.getElementById(a.id))&&a.type=="image"&&!a.status){
			a.pas=c._original_src?c._original_src:c.src;
			if(c.runtimeStyle&&c.runtimeStyle.filter&&c.runtimeStyle.filter.match(/src=['"]([^'"]+)['"]/))a.pas=RegExp.$1
				}else if(c&&!a.status)a.pas=String(c.className);
		if(c&&a.type=="image"&&a[b]){
			a.status=b;
			c.src=a[b]
			}else if(c&&typeof a[b]!="undefined"){
			a.status=b;
			c.className=a[b]
			}
			if(c&&a.type=="input"){
			a.status=b;
			c.disabled=!b
			}
		}
	};

this.set_alttext=function(a,b){
	if(this.buttons[a]&&this.buttons[a].length)for(var c,d,e,f=0;f<this.buttons[a].length;f++){
		c=this.buttons[a][f];
		d=document.getElementById(c.id);
		if(c.type=="image"&&d){
			d.setAttribute("alt",this.get_label(b));
			if((e=d.parentNode)&&e.tagName.toLowerCase()=="a")e.setAttribute("title",this.get_label(b))
				}else d&&
			d.setAttribute("title",this.get_label(b))
			}
		};

this.button_over=function(a,b){
	var c,d=this.buttons[a];
	if(!d||!d.length)return false;
	for(var e=0;e<d.length;e++){
		a=d[e];
		if(a.id==b&&a.status=="act")if((c=document.getElementById(a.id))&&a.over)if(a.type=="image")c.src=a.over;else c.className=a.over
			}
		};

this.button_sel=function(a,b){
	var c,d,e=this.buttons[a];
	if(e&&e.length)for(var f=0;f<e.length;f++){
		c=e[f];
		if(c.id==b&&c.status=="act"){
			if((d=document.getElementById(c.id))&&c.sel)if(c.type=="image")d.src=c.sel;
				else d.className=c.sel;
			this.buttons_sel[b]=a
			}
		}
	};

this.button_out=function(a,b){
	var c,d=this.buttons[a];
	if(d&&d.length)for(var e=0;e<d.length;e++){
		a=d[e];
		if(a.id==b&&a.status=="act")if((c=document.getElementById(a.id))&&a.act)if(a.type=="image")c.src=a.act;else c.className=a.act
			}
		};

this.set_pagetitle=function(a){
	if(a&&document.title)document.title=a
		};

this.display_message=function(a,b,c){
	if(!this.loaded){
		this.pending_message=new Array(a,b);
		return true
		}
		if(this.env.framed&&parent.rcmail)return parent.rcmail.display_message(a,
		b,c);
	if(!this.gui_objects.message)return false;
	this.message_timer&&clearTimeout(this.message_timer);
	a=a;
	if(b)a='<div class="'+b+'">'+a+"</div>";
	a=$(this.gui_objects.message).html(a).show();
	b!="loading"&&a.bind("mousedown",function(){
		j.hide_message();
		return true
		});
	if(!c)this.message_timer=window.setTimeout(function(){
		j.hide_message(true)
		},this.message_time)
	};

this.hide_message=function(a){
	if(this.gui_objects.message)$(this.gui_objects.message).unbind()[a?"fadeOut":"hide"]()
		};

this.select_folder=function(a,
	b,c){
	if(this.gui_objects.folderlist){
		var d;
		if(d=this.get_folder_li(b,c))$(d).removeClass("selected").removeClass("unfocused");
		if(d=this.get_folder_li(a,c))$(d).removeClass("unfocused").addClass("selected");
		this.triggerEvent("selectfolder",{
			folder:a,
			old:b,
			prefix:c
		})
		}
	};

this.get_folder_li=function(a,b){
	b||(b="rcmli");
	if(this.gui_objects.folderlist){
		a=String(a).replace(this.identifier_expr,"_");
		return document.getElementById(b+a)
		}
		return null
	};

this.set_message_coltypes=function(a,b){
	this.env.coltypes=
	a;
	if((a=this.gui_objects.messagelist?this.gui_objects.messagelist.tHead:null)&&b)for(var c,d=0;d<b.length;d++){
		c=a.rows[0].cells[d];
		if(!c){
			c=document.createElement("td");
			a.rows[0].appendChild(c)
			}
			c.innerHTML=b[d].html;
		if(b[d].id)c.id=b[d].id;
		if(b[d].className)c.className=b[d].className
			}
			for(d=0;a&&d<this.env.coltypes.length;d++){
		b=this.env.coltypes[d];
		if((c=a.rows[0].cells[d+1])&&(b=="from"||b=="to")){
			if(c.firstChild&&c.firstChild.tagName.toLowerCase()=="a"){
				c.firstChild.innerHTML=this.get_label(this.env.coltypes[d]);
				c.firstChild.onclick=function(){
					return rcmail.command("sort",this.__col,this)
					};

				c.firstChild.__col=b
				}else c.innerHTML=this.get_label(this.env.coltypes[d]);
			c.id="rcm"+b
			}
		}
	for(c=d+1;a&&c<a.rows[0].cells.length;c++)a.rows[0].removeChild(a.rows[0].cells[c]);
this.env.subject_col=null;
this.env.flagged_col=null;
if((a=$.inArray("subject",this.env.coltypes))>=0){
	this.set_env("subject_col",a);
	if(this.message_list)this.message_list.subject_col=a+1
		}
		if((a=$.inArray("flag",this.env.coltypes))>=0)this.set_env("flagged_col",
	a)
};

this.set_rowcount=function(a){
	$(this.gui_objects.countdisplay).html(a);
	this.set_page_buttons()
	};

this.set_mailboxname=function(a){
	if(this.gui_objects.mailboxname&&a)this.gui_objects.mailboxname.innerHTML=a
		};

this.set_quota=function(a){
	if(a&&this.gui_objects.quotadisplay)typeof a=="object"?this.percent_indicator(this.gui_objects.quotadisplay,a):$(this.gui_objects.quotadisplay).html(a)
		};

this.set_unread_count=function(a,b,c){
	if(!this.gui_objects.mailboxlist)return false;
	this.env.unread_counts[a]=b;
	this.set_unread_count_display(a,c)
	};

this.set_unread_count_display=function(a,b){
	var c,d,e,f,g,h;
	if(e=this.get_folder_li(a)){
		f=this.env.unread_counts[a]?this.env.unread_counts[a]:0;
		d=e.getElementsByTagName("a")[0];
		c=/\s+\([0-9]+\)$/i;
		g=0;
		if((h=e.getElementsByTagName("div")[0])&&h.className.match(/collapsed/))for(var k in this.env.unread_counts)if(k.indexOf(a+this.env.delimiter)==0)g+=this.env.unread_counts[k];if(f&&d.innerHTML.match(c))d.innerHTML=d.innerHTML.replace(c," ("+f+")");
		else if(f)d.innerHTML+=
			" ("+f+")";else d.innerHTML=d.innerHTML.replace(c,"");
		c=new RegExp(RegExp.escape(this.env.delimiter)+"[^"+RegExp.escape(this.env.delimiter)+"]+$");
		a.match(c)&&this.set_unread_count_display(a.replace(c,""),false);
		f+g>0?$(e).addClass("unread"):$(e).removeClass("unread")
		}
		c=/^\([0-9]+\)\s+/i;
	if(b&&document.title){
		a="";
		a=String(document.title);
		a=f&&a.match(c)?a.replace(c,"("+f+") "):f?"("+f+") "+a:a.replace(c,"");
		this.set_pagetitle(a)
		}
	};

this.new_message_focus=function(){
	this.env.framed&&window.parent?
	window.parent.focus():window.focus()
	};

this.toggle_prefer_html=function(a){
	var b;
	if(b=document.getElementById("rcmfd_addrbook_show_images"))b.disabled=!a.checked
		};

this.toggle_preview_pane=function(a){
	var b;
	if(b=document.getElementById("rcmfd_preview_pane_mark_read"))b.disabled=!a.checked
		};

this.set_headers=function(a){
	if(this.gui_objects.all_headers_row&&this.gui_objects.all_headers_box&&a){
		$(this.gui_objects.all_headers_box).html(a).show();
		this.env.framed&&parent.rcmail?parent.rcmail.set_busy(false):
		this.set_busy(false)
		}
	};

this.load_headers=function(a){
	if(!(!this.gui_objects.all_headers_row||!this.gui_objects.all_headers_box||!this.env.uid)){
		$(a).removeClass("show-headers").addClass("hide-headers");
		$(this.gui_objects.all_headers_row).show();
		a.onclick=function(){
			rcmail.hide_headers(a)
			};

		if(!this.gui_objects.all_headers_box.innerHTML){
			this.display_message(this.get_label("loading"),"loading",true);
			this.http_post("headers","_uid="+this.env.uid)
			}
		}
};

this.hide_headers=function(a){
	if(this.gui_objects.all_headers_row&&
		this.gui_objects.all_headers_box){
		$(a).removeClass("hide-headers").addClass("show-headers");
		$(this.gui_objects.all_headers_row).hide();
		a.onclick=function(){
			rcmail.load_headers(a)
			}
		}
};

this.percent_indicator=function(a,b){
	if(!b||!a)return false;
	var c=b.width?b.width:this.env.indicator_width?this.env.indicator_width:100,d=b.height?b.height:this.env.indicator_height?this.env.indicator_height:14,e=b.percent?Math.abs(parseInt(b.percent)):0,f=parseInt(e/100*c),g=$(a).position();
	this.env.indicator_width=c;
	this.env.indicator_height=d;
	if(f>c){
		f=c;
		e=100
		}
		var h=$("<div>");
	h.css({
		position:"absolute",
		top:g.top,
		left:g.left,
		width:c+"px",
		height:d+"px",
		zIndex:100,
		lineHeight:d+"px"
		}).attr("title",b.title).addClass("quota_text").html(e+"%");
	b=$("<div>");
	b.css({
		position:"absolute",
		top:g.top+1,
		left:g.left+1,
		width:f+"px",
		height:d+"px",
		zIndex:99
	});
	f=$("<div>");
	f.css({
		position:"absolute",
		top:g.top+1,
		left:g.left+1,
		width:c+"px",
		height:d+"px",
		zIndex:98
	}).addClass("quota_bg");
	if(e>=80){
		h.addClass(" quota_text_high");
		b.addClass("quota_high")
		}else if(e>=
		55){
		h.addClass(" quota_text_mid");
		b.addClass("quota_mid")
		}else{
		h.addClass(" quota_text_normal");
		b.addClass("quota_low")
		}
		a.innerHTML="";
	$(a).append(b).append(f).append(h)
	};

this.html2plain=function(a,b){
	var c=this,d=this.env.bin_path+"html2text.php";
	this.set_busy(true,"converting");
	$.ajax({
		type:"POST",
		url:d,
		data:a,
		contentType:"application/octet-stream",
		error:function(e){
			c.http_error(e)
			},
		success:function(e){
			c.set_busy(false);
			$(document.getElementById(b)).val(e);
			console.log(e)
			}
		})
};
this.plain2html=function(a,b){
	this.set_busy(true,"converting");
	$(document.getElementById(b)).val("<pre>"+a+"</pre>");
	this.set_busy(false)
	};

this.redirect=function(a,b){
	if(b||b===null)this.set_busy(true);
	if(this.env.framed&&window.parent) {
		parent.location.href=a;
	}
	else {
		var patron = /compose/i;
		if(a.search(patron) != -1) {
			location.href = a;
		} else {
			function OpenFileChooser() {
				if (oXML.readyState == 4) {
					var checknum = window.parent.mailChecknum;
					window.parent.eyeos.callMessage(checknum, 'getDownloadsDir', null, function(filename) {
						var fc = new window.parent.eyeos.dialogs.FileChooser(checknum);
						fc.showSaveAttachmentDialog(window.parent, filename, function(choice, path) {
							console.log(filename);
							if (choice == window.parent.eyeos.dialogs.FileChooser.APPROVE_OPTION) {
								window.parent.eyeos.callMessage(checknum, 'moveFile', [path, filename], function() {
									window.parent.eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [window.parent.tr('File saved successfully')]);
								}, this, {
									onException: function(e) {
										if(e.__eyeos_specialControlMessage_body.name=="EyeAccessControlException"){
											var op = new window.parent.eyeos.dialogs.OptionPane(
												tr('Insufficent permission'),
												window.parent.eyeos.dialogs.OptionPane.ERROR_MESSAGE,
												null,
												null,
												[e.__eyeos_specialControlMessage_body.message]);
											var d = op.createDialog(this._window, tr('Impossible to save document'), function(result, inputValue) {
												window.parent.eyeos.consoleInfo(result);
												window.parent.eyeos.consoleInfo(inputValue);
											});
											d.open();
										}
									}
								});
							}
						}, this);
					}, this);
				}
			}

			var oXML;
			function AjaxCreateObject() {
				var obj;
				if(window.XMLHttpRequest) {
					obj = new XMLHttpRequest();
				} else {
					try{
						obj = new ActiveXObject("Msxml2.XMLHTTP");
					} catch(e) {
						try{
							obj =new ActiveXObject("Microsoft.XMLHTTP");
						} catch(e) {
							alert("Your browser does not support AJAX!"); return false;
						}
					}
				}
				return obj;
			}

			oXML = new AjaxCreateObject();
			oXML.open('GET', a);
			oXML.onreadystatechange = OpenFileChooser;
			oXML.send('');
		}
	}
};

this.goto_url=function(a,b,c){
	this.redirect(this.env.comm_path+"&_action="+a+(b?"&"+b:""),c)
	};

this.http_request=function(a,b,c){
	b+=(b?"&":"")+"_remote=1";
	a=this.env.comm_path+"&_action="+a+"&"+b;
	console.log("HTTP GET: "+
		a);
	$.get(a,{
		_unlock:c?1:0
		},function(d){
		j.http_response(d)
		},"json")
	};

this.http_post=function(a,b,c){
	a=this.env.comm_path+"&_action="+a;
	if(b&&typeof b=="object"){
		b._remote=1;
		b._unlock=c?1:0
		}else b+=(b?"&":"")+"_remote=1"+(c?"&_unlock=1":"");
	console.log("HTTP POST: "+a);
	$.post(a,b,function(d){
		j.http_response(d)
		},"json")
	};

this.http_response=function(a){
	a.unlock&&this.set_busy(false);
	a.env&&this.set_env(a.env);
	if(typeof a.texts=="object")for(var b in a.texts)typeof a.texts[b]=="string"&&this.add_label(b,
		a.texts[b]);if(a.exec){
		console.log(a.exec);
		eval(a.exec)
		}
		if(a.callbacks&&a.callbacks.length)for(b=0;b<a.callbacks.length;b++)this.triggerEvent(a.callbacks[b][0],a.callbacks[b][1]);
	switch(a.action){
		case "delete":
			if(this.task=="addressbook"){
			a=this.contact_list.get_selection();
			this.enable_command("compose",a&&this.contact_list.rows[a]);
			this.enable_command("delete","edit",a&&this.contact_list.rows[a]&&this.env.address_sources&&!this.env.address_sources[this.env.source].readonly);
			this.enable_command("export",
				this.contact_list&&this.contact_list.rowcount>0)
			}
			case "moveto":
			if(this.env.action=="show")this.enable_command("reply","reply-all","forward","delete","mark","print","open","edit","viewsource","download",true);else this.message_list&&this.message_list.init();
			break;
		case "purge":case "expunge":
			if(!this.env.messagecount&&this.task=="mail"){
			this.env.contentframe&&this.show_contentframe(false);
			this.enable_command("show","reply","reply-all","forward","moveto","copy","delete","mark","viewsource","open","edit",
				"download","print","load-attachment","purge","expunge","select-all","select-none","sort","expand-all","expand-unread","collapse-all",false)
			}
			break;
		case "check-recent":case "getunread":case "search":case "list":
			if(this.task=="mail"){
			if(this.message_list&&(a.action=="list"||a.action=="search")){
				this.msglist_select(this.message_list);
				this.expand_threads()
				}
				this.enable_command("show","expunge","select-all","select-none","sort",this.env.messagecount>0);
			this.enable_command("purge",this.purge_mailbox_test());
			this.enable_command("expand-all","expand-unread","collapse-all",this.env.threading&&this.env.messagecount);
			a.action=="list"&&this.triggerEvent("listupdate",{
				folder:this.env.mailbox,
				rowcount:this.message_list.rowcount
				})
			}else if(this.task=="addressbook"){
			this.enable_command("export",this.contact_list&&this.contact_list.rowcount>0);
			if(a.action=="list"){
				this.enable_command("group-create",this.env.address_sources[this.env.source].groups);
				this.enable_command("group-rename","group-delete",this.env.address_sources[this.env.source].groups&&
					this.env.group);
				this.triggerEvent("listupdate",{
					folder:this.env.source,
					rowcount:this.contact_list.rowcount
					})
				}
			}
		break
		}
	};

this.http_error=function(a){
	var b=a.statusText;
	this.set_busy(false);
	a.abort();
	b&&this.display_message(this.get_label("servererror")+" ("+b+")","error")
	};

this.send_keep_alive=function(){
	this.http_request("keep-alive","_t="+(new Date).getTime())
	};

this.start_keepalive=function(){
	if(this.env.keep_alive&&!this.env.framed&&this.task=="mail"&&this.gui_objects.mailboxlist)this._int=setInterval(function(){
		j.check_for_recent(false)
		},
	this.env.keep_alive*1E3);
	else if(this.env.keep_alive&&!this.env.framed&&this.task!="login")this._int=setInterval(function(){
		j.send_keep_alive()
		},this.env.keep_alive*1E3)
	};

this.check_for_recent=function(a){
	if(!this.busy){
		var b="_t="+(new Date).getTime()+"&_mbox="+urlencode(this.env.mailbox);
		if(a){
			this.set_busy(true,"checkingmail");
			b+="&_refresh=1"
			}
			if(this.gui_objects.messagelist)b+="&_list=1";
		if(this.gui_objects.quotadisplay)b+="&_quota=1";
		if(this.env.search_request)b+="&_search="+this.env.search_request;
		this.http_request("check-recent",b,true)
		}
	};

this.get_single_uid=function(){
	return this.env.uid?this.env.uid:this.message_list?this.message_list.get_single_selection():null
	};

this.get_single_cid=function(){
	return this.env.cid?this.env.cid:this.contact_list?this.contact_list.get_single_selection():null
	};

this.get_caret_pos=function(a){
	if(typeof a.selectionEnd!="undefined")return a.selectionEnd;
	else if(document.selection&&document.selection.createRange){
		var b=document.selection.createRange();
		if(b.parentElement()!=
			a)return 0;
		var c=b.duplicate();
		a.tagName=="TEXTAREA"?c.moveToElementText(a):c.expand("textedit");
		c.setEndPoint("EndToStart",b);
		b=c.text.length;
		return b<=a.value.length?b:-1
		}else return a.value.length
		};

this.set_caret_pos=function(a,b){
	if(a.setSelectionRange)a.setSelectionRange(b,b);
	else if(a.createTextRange){
		a=a.createTextRange();
		a.collapse(true);
		a.moveEnd("character",b);
		a.moveStart("character",b);
		a.select()
		}
	};

this.lock_form=function(a,b){
	if(a&&a.elements)for(var c,d=0;d<a.elements.length;d++){
		c=a.elements[d];
		if(c!="hidden")a.elements[d].disabled=b
			}
		}
	}

function delete_attachment(id) {
	var elementList = document.getElementById(id);
		var padre = elementList.parentNode;
		padre.removeChild(elementList);
}
rcube_webmail.prototype.addEventListener=rcube_event_engine.prototype.addEventListener;
rcube_webmail.prototype.removeEventListener=rcube_event_engine.prototype.removeEventListener;
rcube_webmail.prototype.triggerEvent=rcube_event_engine.prototype.triggerEvent;
