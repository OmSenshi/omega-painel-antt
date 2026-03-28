// pages/arrendamento.js — Cadastrar Contrato de Arrendamento (v58 — tema dark)
(function(){
  var U   = window.OmegaUtils;
  var jq  = window.OmegaJQ;
  var mom = window.OmegaMom;

  // ── ABA: CRLV ───────────────────────────────────────────────────
  U.registrarAba('crlv', 'CRLV', ''
    +'<div id="omega-dropzone" class="om-dropzone">'
      +'<div class="om-drop-txt" id="omega-drop-txt">Arraste o CRLV aqui<br><span>(PDF ou imagem)</span></div>'
    +'</div>'
    +'<input type="file" id="omega-file-input" accept=".pdf,image/*" style="display:none">'
    +'<div id="omega-extract-status"></div>'
    +'<div class="om-flex om-mb">'
      +'<input id="omega-import-input" class="om-input om-input-sm" placeholder="Cole o codigo OMEGA aqui" style="flex:1">'
      +'<button id="omega-import-btn" class="om-btn om-btn-coral om-btn-sm" style="white-space:nowrap">Importar</button>'
    +'</div>'
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<div>'
        +'<label class="om-label">CPF / CNPJ</label>'
        +'<input id="antt-cpf-input" class="om-input" placeholder="00000000000">'
        +'<div id="antt-preview" class="om-preview"></div>'
      +'</div>'
      +'<div>'
        +'<label class="om-label">Nome</label>'
        +'<input id="antt-nome-input" class="om-input" placeholder="Nome completo">'
        +'<div id="antt-nome-preview" class="om-preview"></div>'
      +'</div>'
    +'</div>'
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<div>'
        +'<label class="om-label">Placa</label>'
        +'<input id="antt-placa-input" class="om-input" placeholder="ABC1234" maxlength="8" style="text-transform:uppercase">'
        +'<div id="antt-placa-preview" class="om-preview"></div>'
      +'</div>'
      +'<div>'
        +'<label class="om-label">Renavam</label>'
        +'<input id="antt-renavam-input" class="om-input" placeholder="00000000000" maxlength="15">'
      +'</div>'
    +'</div>'
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<button id="antt-btn" class="om-btn om-btn-blue">Subst. CPF/Nome</button>'
      +'<button id="antt-veiculo-btn" class="om-btn om-btn-blue">Preencher e Verificar</button>'
    +'</div>'
    +'<div id="antt-status"></div>'
    +'<div id="antt-veiculo-status"></div>'
  );

  // ── ABA: CONTRATO ───────────────────────────────────────────────
  U.registrarAba('contrato', 'Contrato', ''
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<button id="antt-data-btn" class="om-btn om-btn-green">Preencher Data</button>'
      +'<button id="antt-check-btn" class="om-btn om-btn-purple">Marcar Declaracoes</button>'
    +'</div>'
    +'<div id="antt-data-status"></div>'
    +'<div id="antt-check-status"></div>'
  );

  // ── ABA: HISTORICO ──────────────────────────────────────────────
  U.registrarAba('historico', 'Historico', ''
    +'<div id="omega-historico-lista" class="om-hist-scroll"></div>'
    +'<div id="omega-historico-vazio" class="om-vazio">Nenhum registro nas ultimas 24h</div>'
  , function(){ renderHistorico(); });

  // ── Helper: setar campo ─────────────────────────────────────────
  function setarCampo(id, valor){
    var el = document.getElementById(id);
    if(el && valor){ el.value = valor; el.dispatchEvent(new Event('input')); }
  }
  function preencherCamposCRLV(dados){
    if(dados.cpf)     setarCampo('antt-cpf-input', dados.cpf);
    if(dados.nome)    setarCampo('antt-nome-input', dados.nome.toUpperCase());
    if(dados.placa)   setarCampo('antt-placa-input', dados.placa.toUpperCase());
    if(dados.renavam){ var el=document.getElementById('antt-renavam-input'); if(el) el.value=dados.renavam; }
  }

  // ── Drag and Drop ────────────────────────────────────────────────
  var dropzone=document.getElementById('omega-dropzone'), fileInput=document.getElementById('omega-file-input');
  var dropTxt=document.getElementById('omega-drop-txt'), exSt=document.getElementById('omega-extract-status');
  dropzone.addEventListener('click', function(){ fileInput.click(); });
  dropzone.addEventListener('dragover', function(e){ e.preventDefault(); dropzone.classList.add('om-dropzone-active'); });
  dropzone.addEventListener('dragleave', function(){ dropzone.classList.remove('om-dropzone-active'); });
  dropzone.addEventListener('drop', function(e){
    e.preventDefault(); dropzone.classList.remove('om-dropzone-active');
    var file=e.dataTransfer.files[0]; if(file) processarArquivo(file);
  });
  fileInput.addEventListener('change', function(){ if(this.files[0]) processarArquivo(this.files[0]); });

  function processarArquivo(file) {
    dropTxt.innerHTML = file.name;
    U.box(exSt, true, 'Extraindo dados...');
    window.OmegaExtractor.extrair(file,
      function(dados){ preencherCamposCRLV(dados); U.adicionarHistorico(dados); U.box(exSt, true, 'Dados extraidos! Revise e clique nos botoes.'); },
      function(erro){ U.box(exSt, false, erro); }
    );
  }

  // ── Previews ─────────────────────────────────────────────────────
  document.getElementById('antt-cpf-input').addEventListener('input', function(){
    var r=this.value.replace(/\D/g,''), p=document.getElementById('antt-preview');
    if(r.length===11)      p.innerHTML='<span class="ok">'+U.fCPF(r)+'</span>';
    else if(r.length===14) p.innerHTML='<span class="ok">'+U.fCNPJ(r)+'</span>';
    else if(r.length>0)    p.innerHTML='<span class="warn">'+r.length+' dig.</span>';
    else p.textContent='';
  });
  document.getElementById('antt-nome-input').addEventListener('input', function(){
    var p=document.getElementById('antt-nome-preview'), v=this.value.trim();
    p.innerHTML = v ? '<span class="ok">'+v.toUpperCase()+'</span>' : '';
  });
  document.getElementById('antt-placa-input').addEventListener('input', function(){
    var p=document.getElementById('antt-placa-preview'), raw=this.value.replace(/[^A-Z0-9]/gi,'').toUpperCase(), val=U.validarPlaca(raw);
    if(val) p.innerHTML='<span class="ok">'+U.formatarPlaca(val)+'</span>';
    else if(raw.length>0) p.innerHTML='<span class="warn">'+raw.length+'/7</span>';
    else p.textContent='';
  });

  // ── Substituir CPF + Nome ────────────────────────────────────────
  document.getElementById('antt-btn').addEventListener('click', function(){
    var st=document.getElementById('antt-status');
    var raw=document.getElementById('antt-cpf-input').value.replace(/\D/g,'');
    var nn=document.getElementById('antt-nome-input').value.trim().toUpperCase();
    var msgs=[];
    if(raw&&(raw.length===11||raw.length===14)){
      var nf=U.fAuto(raw), ap=null;
      var nt=document.getElementById('NomesTransportador');
      if(nt&&nt.value){try{var arr=JSON.parse(nt.value);if(arr&&arr[0]&&arr[0].CpfCnpj)ap=arr[0].CpfCnpj.replace(/\D/g,'');}catch(e){}}
      if(!ap) ap=U.getDoc();
      var tot=0;
      if(ap){var r1=U.substituirTudo(U.fAuto(ap),nf),r2=U.substituirTudo(ap,raw);tot=r1.total+r2.total;}
      var novoJson=JSON.stringify([{"CpfCnpj":raw,"Nome":nn||""}]);
      var nt2=document.getElementById('NomesTransportador');
      if(nt2){nt2.value=novoJson;nt2.setAttribute('value',novoJson);}
      ['Placa','Renavam','DataInicio','DataFim'].forEach(function(id){var el=document.getElementById(id);if(el&&el.getAttribute('cpfcnpjs'))el.setAttribute('cpfcnpjs',novoJson);});
      var sel=document.getElementById('CPFCNPJArrendanteTransportador'),selecionou=false;
      if(sel&&jq){
        for(var i=0;i<sel.options.length;i++){if(sel.options[i].value.replace(/\D/g,'')===raw||sel.options[i].text.replace(/\D/g,'')===raw){jq(sel).val(sel.options[i].value).trigger('change');selecionou=true;break;}}
        if(!selecionou){for(var i=0;i<sel.options.length;i++){if(sel.options[i].text&&sel.options[i].text!=='Selecione'){jq(sel).val(sel.options[i].value).trigger('change');selecionou=true;break;}}}
      }
      msgs.push('CPF: <b>'+nf+'</b> ('+tot+' trocas'+(selecionou?', selecionado':'')+')');
    }
    if(nn){var an=U.getNome();if(an){var res=U.substituirTudo(an,nn);var cv=document.getElementById('NomeArrendanteInput');if(cv){cv.removeAttribute('disabled');cv.value=nn;cv.setAttribute('disabled','disabled');}msgs.push('Nome: <b>'+nn+'</b> ('+res.total+' trocas)');}}
    if(msgs.length>0) U.box(st,true,msgs.join('<br>')); else U.box(st,false,'Preencha CPF/CNPJ ou Nome.');
  });

  // ── Preencher e Verificar ────────────────────────────────────────
  document.getElementById('antt-veiculo-btn').addEventListener('click', function(){
    var st=document.getElementById('antt-veiculo-status');
    var placaRaw=document.getElementById('antt-placa-input').value.replace(/[^A-Z0-9]/gi,'').toUpperCase();
    var renavamRaw=document.getElementById('antt-renavam-input').value.trim();
    var placaVal=U.validarPlaca(placaRaw);
    if(!placaVal) return U.box(st,false,'Placa invalida.');
    if(!renavamRaw) return U.box(st,false,'Preencha o Renavam.');
    var campoPlaca=document.getElementById('Placa'),campoRenavam=document.getElementById('Renavam');
    if(!campoPlaca||!campoRenavam) return U.box(st,false,'Campos nao encontrados na pagina.');
    U.box(st,true,'Preenchendo...');campoPlaca.removeAttribute('disabled');
    U.digitarCharAChar(campoPlaca,placaVal,{delay:80,delayEspecial:{4:150},onDone:function(){
      var pf=campoPlaca.value;campoRenavam.removeAttribute('disabled');campoRenavam.value=renavamRaw;
      campoRenavam.dispatchEvent(new Event('input',{bubbles:true}));campoRenavam.dispatchEvent(new Event('change',{bubbles:true}));campoRenavam.dispatchEvent(new Event('blur',{bubbles:true}));
      ST(function(){var jqRef=unsafeWindow.jQuery;jqRef.ajax({type:'GET',url:'/ContratoArrendamento/verificarVeiculo',cache:false,data:{placa:campoPlaca.value.toUpperCase(),renavam:campoRenavam.value,cpfCnpjProprietario:document.getElementById('CPFCNPJArrendante').value},
        success:function(resp){if(resp&&resp.success===true){var di=document.getElementById('DataInicio'),df=document.getElementById('DataFim'),ca=document.getElementById('CPFCNPJArrendatario');if(di)di.removeAttribute('disabled');if(df)df.removeAttribute('disabled');if(ca)ca.removeAttribute('disabled');try{if(jqRef('#DataInicio').data('DateTimePicker'))jqRef('#DataInicio').data('DateTimePicker').enable();if(jqRef('#DataFim').data('DateTimePicker'))jqRef('#DataFim').data('DateTimePicker').enable();}catch(e){}jqRef('#DataInicio input,#DataFim input').removeAttr('disabled').removeAttr('readonly');jqRef('#DataInicioIcon,#DataFimIcon').css('pointer-events','auto').css('opacity','1');var sel=document.getElementById('CPFCNPJArrendanteTransportador');if(sel)jqRef(sel).trigger('change');U.box(st,true,'Verificado! Placa <b>'+pf+'</b> OK');}else{U.box(st,false,(resp&&resp.ErrorMessage)?resp.ErrorMessage:'Veiculo nao encontrado.');}},
        error:function(xhr,status){U.box(st,false,'Erro: '+status);}});},400);
    }});
  });

  // ── Preencher Data ───────────────────────────────────────────────
  document.getElementById('antt-data-btn').addEventListener('click', function(){
    var ds=document.getElementById('antt-data-status');
    if(!jq||!mom)return U.box(ds,false,'jQuery ou moment nao encontrados.');
    var hj=new Date(),dd=String(hj.getDate()).padStart(2,'0'),mm=String(hj.getMonth()+1).padStart(2,'0'),yy=hj.getFullYear();
    var di=dd+'/'+mm+'/'+yy,fim=new Date(hj);fim.setFullYear(fim.getFullYear()+1);
    var df=String(fim.getDate()).padStart(2,'0')+'/'+String(fim.getMonth()+1).padStart(2,'0')+'/'+fim.getFullYear();
    U.injetarData('DataInicio',di);U.injetarData('DataFim',df);
    ST(function(){var vi=jq('#DataInicio').find('input').first().val(),vf=jq('#DataFim').find('input').first().val();
      if(vi===di&&vf===df)U.box(ds,true,'Datas: <b>'+di+'</b> ate <b>'+df+'</b>');
      else if(!vi&&!vf)U.box(ds,false,'Clique em Verificar primeiro.');
      else U.box(ds,false,'Parcial — Inicio: '+(vi||'vazio')+' | Fim: '+(vf||'vazio'));
    },400);
  });

  // ── Marcar Declaracoes ───────────────────────────────────────────
  document.getElementById('antt-check-btn').addEventListener('click', function(){
    var st=document.getElementById('antt-check-status');
    var c1=document.getElementById('ExisteContrato'),c2=document.getElementById('InformacoesVerdadeiras');
    if(!c1||!c2)return U.box(st,false,'Checkboxes nao encontrados.');
    function marcar(cb){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));cb.dispatchEvent(new Event('click',{bubbles:true}));}
    marcar(c1);marcar(c2);
    if(c1.checked&&c2.checked)U.box(st,true,'Declaracoes marcadas!');else U.box(st,false,'Erro ao marcar.');
  });

  // ── Historico ────────────────────────────────────────────────────
  function isPaginaVeiculo(){var mc=document.querySelector('.main_content');if(!mc)return false;var t=mc.getAttribute('data-tipo-pedido')||'';return t==='MovimentacaoFrota'||t==='Cadastro';}

  function renderHistorico(){
    var lista=U.carregarHistorico(),el=document.getElementById('omega-historico-lista'),vazio=document.getElementById('omega-historico-vazio');
    if(!el)return;
    if(lista.length===0){el.innerHTML='';if(vazio)vazio.style.display='block';return;}
    if(vazio)vazio.style.display='none';
    var ehPV=isPaginaVeiculo();
    el.innerHTML=lista.map(function(item,idx){
      var tempo=U.tempoRelativo(item.ts);
      var botoes='<div style="display:flex;gap:4px">'
        +'<button onclick="OmegaImportarHistorico('+idx+')" class="om-btn om-btn-blue om-btn-sm">Usar</button>';
      if(ehPV) botoes+='<button onclick="OmegaInserirVeiculo('+idx+')" class="om-btn om-btn-green om-btn-sm">Veiculo</button>';
      botoes+='<button onclick="OmegaRemoverHistorico('+idx+')" class="om-btn-list om-btn-del">x</button></div>';
      return '<div class="om-hist-item"><div><div class="om-hist-placa">'+U.formatarPlaca(item.placa)+'</div><div class="om-hist-tempo">'+tempo+'</div></div>'+botoes+'</div>';
    }).join('');
  }

  unsafeWindow.OmegaRemoverHistorico=function(idx){var lista=U.carregarHistorico();lista.splice(idx,1);U.salvarHistorico(lista);renderHistorico();};

  unsafeWindow.OmegaImportarHistorico=function(idx){
    var lista=U.carregarHistorico(),item=lista[idx];if(!item)return;
    preencherCamposCRLV(item);OmegaAba('crlv');U.box(document.getElementById('omega-extract-status'),true,'Dados importados do historico!');
  };

  unsafeWindow.OmegaInserirVeiculo=function(idx){
    var lista=U.carregarHistorico(),item=lista[idx];if(!item)return;
    var jqRef=unsafeWindow.jQuery||unsafeWindow.$,st=document.getElementById('omega-extract-status');
    var modal=document.getElementById('manterVeiculoModal'),aberto=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
    var tt=modal?modal.querySelector('.modal-title'):null,ehV=tt&&tt.textContent.indexOf('Dados do Ve')!==-1;
    function preencher(){
      var cp=document.getElementById('Placa'),cr=document.getElementById('Renavam'),bv=document.getElementById('verificar');
      if(!cp||!cr){U.box(st,false,'Modal do veiculo nao abriu.');return;}
      var pv=(item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();cp.removeAttribute('disabled');
      U.digitarCharAChar(cp,pv,{delay:80,delayEspecial:{4:150},onDone:function(){
        ST(function(){cr.removeAttribute('disabled');cr.value=item.renavam||'';cr.dispatchEvent(new Event('input',{bubbles:true}));cr.dispatchEvent(new Event('change',{bubbles:true}));cr.dispatchEvent(new Event('blur',{bubbles:true}));
          ST(function(){
            jqRef.ajax({type:'GET',url:'/Veiculo/BuscarVeiculo',cache:false,data:{placa:cp.value.toUpperCase(),renavam:cr.value},success:function(){ST(function(){if(bv)bv.click();},500);},error:function(){ST(function(){if(bv)bv.click();},500);}});
            var _jaSalvou=false;function salvar(){if(_jaSalvou)return;_jaSalvou=true;var tara=document.getElementById('Tara');if(tara&&(!tara.value||tara.value==='')){tara.removeAttribute('disabled');tara.value='2';jqRef(tara).trigger('input').trigger('change');}ST(function(){var bs=document.querySelector('.btn-salvar-veiculo');if(bs){bs.removeAttribute('disabled');bs.click();U.box(st,true,'Veiculo salvo! Placa: <b>'+cp.value+'</b>');}else U.box(st,false,'Botao Salvar nao encontrado.');},800);}
            U.poll(function(){var bb=document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');if(bb&&bb.offsetParent!==null)return{tipo:'bootbox',btn:bb};var ch=document.getElementById('Chassi');if(ch&&ch.value&&ch.value.trim()!=='')return{tipo:'chassi'};return null;},
              function(r){if(r.tipo==='chassi'){salvar();return;}U.box(st,true,'Popup! Confirmando em 3s...');ST(function(){r.btn.click();ST(function(){U.poll(function(){var m2=document.getElementById('manterVeiculoModal'),t2=m2?m2.querySelector('.modal-title'):null;var e=t2&&t2.textContent.indexOf('Movimenta')!==-1,v=m2&&(m2.style.display==='block'||m2.classList.contains('show'));var bx=document.querySelector('.btn-confirmar-exclusao');return(e&&v&&bx)?bx:null;},function(bx){ST(function(){bx.click();ST(function(){var bi=document.querySelector('.btn-confirmar-inclusao');if(bi)bi.click();ST(salvar,1500);},1500);},500);},{maxTentativas:15,intervalo:300,onTimeout:salvar});},1500);},3000);},
              {maxTentativas:20,intervalo:300,onTimeout:salvar});
          },400);
        },300);
      }});
    }
    if(aberto&&ehV){U.box(st,true,'Preenchendo veiculo...');preencher();}
    else{var ba=document.querySelector('[data-action*="VeiculoPedido/Novo"]');if(!ba){U.box(st,false,'Botao nao encontrado.');return;}U.box(st,true,'Abrindo popup...');ba.click();ST(preencher,1500);}
  };

  // ── Importacao manual ────────────────────────────────────────────
  document.getElementById('omega-import-btn').addEventListener('click', function(){
    var codigo=document.getElementById('omega-import-input').value.trim(),exSt=document.getElementById('omega-extract-status');
    if(!codigo)return U.box(exSt,false,'Cole o codigo de importacao.');
    var dados=U.parseCodigo(codigo);if(!dados.placa&&!dados.renavam)return U.box(exSt,false,'Codigo invalido.');
    preencherCamposCRLV(dados);U.adicionarHistorico(dados);document.getElementById('omega-import-input').value='';
    U.box(exSt,true,'Dados importados! Revise e clique nos botoes.');
  });

  document.getElementById('antt-cpf-input').focus();
})();
