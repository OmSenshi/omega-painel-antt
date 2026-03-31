// pages/cadastro.js — modulo: Cadastro e Movimentacao de Frota (v63 — pente fino)
(function(){
  console.log('[OMEGA][cadastro] v63 carregado');
  var U   = window.OmegaUtils;
  var jqR = unsafeWindow.jQuery || unsafeWindow.$;
  var EX  = window.OmegaExtractor;
  if(!U) { console.error('[OMEGA][cadastro] OmegaUtils nao encontrado!'); return; }
  if(!EX) { console.error('[OMEGA][cadastro] OmegaExtractor nao encontrado!'); }

  function abaPortalAtiva(){ var t=document.querySelector('.nav-tabs .nav-link.active'); return t?t.getAttribute('href'):''; }
  function tipoPedido(){ var el=document.querySelector('.main_content'); return el?(el.getAttribute('data-tipo-pedido')||''):''; }
  function tipoCadastro(){ var c=document.getElementById('CpfCnpjTransportador'); if(!c||!c.value)return'CPF'; return c.value.replace(/\D/g,'').length===14?'CNPJ':'CPF'; }

  function htmlDrop(id, label, sub){
    return '<div id="'+id+'" class="om-dropzone" style="padding:10px;margin-bottom:6px"><div class="om-drop-txt" id="'+id+'-txt">'+label+'<br><span>'+(sub||'PDF ou imagem')+'</span></div></div><input type="file" id="'+id+'-file" accept=".pdf,image/*" style="display:none">';
  }
  function setupDrop(zoneId, onFile){
    var zone=document.getElementById(zoneId), fi=document.getElementById(zoneId+'-file');
    if(!zone||!fi)return;
    zone.addEventListener('click',function(){fi.click();});
    zone.addEventListener('dragover',function(e){e.preventDefault();zone.classList.add('om-dropzone-active');});
    zone.addEventListener('dragleave',function(){zone.classList.remove('om-dropzone-active');});
    zone.addEventListener('drop',function(e){e.preventDefault();zone.classList.remove('om-dropzone-active');if(e.dataTransfer.files[0])onFile(e.dataTransfer.files[0]);});
    fi.addEventListener('change',function(){if(this.files[0])onFile(this.files[0]);});
  }
  function set(id,val){var el=document.getElementById(id);if(el)el.value=val||'';}
  function val(id){var el=document.getElementById(id);return el?el.value.trim():'';}

  // Helper: selecionar dropdown de forma robusta (selectedIndex + value + trigger)
  function selecionarDropdown(selectEl, valor){
    if(!selectEl)return;
    for(var i=0;i<selectEl.options.length;i++){
      if(selectEl.options[i].value===valor){selectEl.selectedIndex=i;break;}
    }
    selectEl.value=valor;
    jqR(selectEl).trigger('change');
  }

  // Helper: parar automacao com erro
  function pararAutomacao(st,msg){
    window._omegaAutomacaoAtiva=false;
    U.box(st,false,msg);
  }

  // ── ABA: CADASTRO ───────────────────────────────────────────────
  U.registrarAba('cadastro', 'Cadastro', ''
    +'<div class="om-flex om-mb">'
      +'<input id="omega-cad-import-input" class="om-input om-input-sm" placeholder="Cole o codigo OMEGA Cadastro aqui" style="flex:1">'
      +'<button type="button" id="omega-cad-import-btn" class="om-btn om-btn-coral om-btn-sm" style="white-space:nowrap">Importar</button>'
    +'</div>'
    +'<div id="omega-cad-import-status"></div>'

    +'<div id="omega-cad-tipo-btns" class="om-grid om-grid-2 om-mb">'
      +'<button type="button" id="omega-cad-btn-cpf" class="om-btn om-btn-blue">Cadastro CPF</button>'
      +'<button type="button" id="omega-cad-btn-cnpj" class="om-btn om-btn-purple">Cadastro CNPJ</button>'
    +'</div>'

    // ═══════ FORMULARIO CPF ═══════
    +'<div id="omega-cad-form-cpf" style="display:none">'
      +'<button type="button" id="omega-cad-voltar-cpf" class="om-btn-list" style="color:#5a9cf5;background:none;border:none;padding:2px 0;margin-bottom:8px;font-size:11px;cursor:pointer">&#8592; Voltar</button>'
      +'<div class="om-badge">Cadastro CPF</div>'

      +htmlDrop('omega-drop-cnh','Arraste a CNH ou RG aqui','Preenche identidade e UF automaticamente')
      +'<div id="omega-drop-cnh-status"></div>'
      +'<div class="om-section-title">Identidade / CNH</div>'
      +'<div class="om-grid om-grid-21 om-mb-sm">'
        +'<div><label class="om-label">Numero</label><input id="omega-cad-identidade" class="om-input" placeholder="000000"></div>'
        +'<div><label class="om-label">UF</label><input id="omega-cad-uf" class="om-input" placeholder="MG" maxlength="2" style="text-transform:uppercase"></div>'
      +'</div>'

      +htmlDrop('omega-drop-endereco','Arraste o Comprovante de Endereco aqui','Opcional — preenche CEP, rua, numero, bairro')
      +'<div id="omega-drop-endereco-status"></div>'
      +'<div class="om-section-title">Endereco</div>'
      +'<div class="om-grid om-grid-2 om-mb-sm">'
        +'<div><label class="om-label">CEP</label><input id="omega-cad-cep" class="om-input" placeholder="00000000"></div>'
        +'<div><label class="om-label">Numero</label><input id="omega-cad-numero" class="om-input" placeholder="0"></div>'
      +'</div>'
      +'<div class="om-mb-sm"><label class="om-label">Logradouro</label><input id="omega-cad-logradouro" class="om-input" placeholder="Nome da rua"></div>'
      +'<div class="om-grid om-grid-2 om-mb-sm">'
        +'<div><label class="om-label">Bairro</label><input id="omega-cad-bairro" class="om-input" placeholder="Bairro"></div>'
        +'<div><label class="om-label">Complemento</label><input id="omega-cad-complemento" class="om-input" placeholder="Apto..."></div>'
      +'</div>'

      +'<div id="omega-cad-resumo-cpf"></div>'
      +'<button type="button" id="omega-cad-iniciar-cpf" class="om-btn om-btn-green om-btn-full" style="margin-top:4px">&#9654; Iniciar Automacao CPF</button>'
      +'<div id="omega-cad-status-cpf"></div>'
    +'</div>'

    // ═══════ FORMULARIO CNPJ ═══════
    +'<div id="omega-cad-form-cnpj" style="display:none">'
      +'<button type="button" id="omega-cad-voltar-cnpj" class="om-btn-list" style="color:#5a9cf5;background:none;border:none;padding:2px 0;margin-bottom:8px;font-size:11px;cursor:pointer">&#8592; Voltar</button>'
      +'<div class="om-badge" style="background:linear-gradient(135deg,#6f42c1,#5a35a0)">Cadastro CNPJ</div>'

      +htmlDrop('omega-drop-cnpj','Arraste a Inscricao CNPJ / MEI aqui','Preenche endereco, telefone e email')
      +'<div id="omega-drop-cnpj-status"></div>'
      +'<div class="om-section-title">Endereco</div>'
      +'<div class="om-grid om-grid-2 om-mb-sm">'
        +'<div><label class="om-label">CEP</label><input id="omega-cad-cnpj-cep" class="om-input" placeholder="00000000"></div>'
        +'<div><label class="om-label">Numero</label><input id="omega-cad-cnpj-numero" class="om-input" placeholder="0"></div>'
      +'</div>'
      +'<div class="om-mb-sm"><label class="om-label">Logradouro</label><input id="omega-cad-cnpj-logradouro" class="om-input" placeholder="Nome da rua"></div>'
      +'<div class="om-grid om-grid-2 om-mb-sm">'
        +'<div><label class="om-label">Bairro</label><input id="omega-cad-cnpj-bairro" class="om-input" placeholder="Bairro"></div>'
        +'<div><label class="om-label">Complemento</label><input id="omega-cad-cnpj-complemento" class="om-input" placeholder="Apto..."></div>'
      +'</div>'
      +'<div class="om-section-title">Contato</div>'
      +'<div class="om-grid om-grid-2 om-mb-sm">'
        +'<div><label class="om-label">Telefone</label><input id="omega-cad-cnpj-telefone" class="om-input" placeholder="0000000000"></div>'
        +'<div><label class="om-label">Email</label><input id="omega-cad-cnpj-email" class="om-input" placeholder="email@exemplo.com"></div>'
      +'</div>'

      +htmlDrop('omega-drop-socio','Arraste a CNH do Socio aqui','Opcional — preenche CPF do socio')
      +'<div id="omega-drop-socio-status"></div>'
      +'<div class="om-section-title">Gestor / Socio</div>'
      +'<div class="om-mb-sm"><label class="om-label">CPF do Socio</label><input id="omega-cad-cnpj-cpf-socio" class="om-input" placeholder="00000000000"></div>'

      +'<div id="omega-cad-resumo-cnpj"></div>'
      +'<button type="button" id="omega-cad-iniciar-cnpj" class="om-btn om-btn-green om-btn-full" style="margin-top:4px">&#9654; Iniciar Automacao CNPJ</button>'
      +'<div id="omega-cad-status-cnpj"></div>'
    +'</div>'

    // Acoes manuais
    +'<div id="omega-cad-acoes" style="display:none">'
      +'<hr class="om-hr">'
      +'<div id="omega-cad-contatos" style="display:none"><div class="om-section-title">Endereco</div><div class="om-grid om-grid-3 om-mb-sm"><button id="omega-cep-mg" class="om-btn om-btn-blue">MG</button><button id="omega-cep-sp" class="om-btn om-btn-blue">SP</button><button id="omega-cep-rj" class="om-btn om-btn-blue">RJ</button></div><div id="omega-cep-status"></div><hr class="om-hr"><div class="om-section-title">Contato</div><button id="omega-contato-btn" class="om-btn om-btn-blue om-btn-full">Adicionar Telefone + Email</button><div id="omega-contato-status"></div></div>'
      +'<div id="omega-cad-rt" style="display:none"><div class="om-section-title">Responsavel Tecnico</div><button id="omega-rt-btn" class="om-btn om-btn-blue om-btn-full">Adicionar RT</button><div id="omega-rt-status"></div></div>'
      +'<div id="omega-cad-veiculo" style="display:none"><div class="om-section-title">Veiculo</div><div id="omega-veiculo-hist" class="om-hist-scroll om-mb-sm"></div><div id="omega-veiculo-vazio" class="om-vazio">Nenhum veiculo no historico</div><div id="omega-veiculo-status"></div></div>'
    +'</div>'
  , function(){ atualizarSecaoAcoes(); });

  // ═══════════════ NAVEGACAO ═══════════════

  function resetar(){
    document.getElementById('omega-cad-tipo-btns').style.display='';
    document.getElementById('omega-cad-form-cpf').style.display='none';
    document.getElementById('omega-cad-form-cnpj').style.display='none';
    ['omega-cad-identidade','omega-cad-uf','omega-cad-cep','omega-cad-logradouro','omega-cad-numero','omega-cad-bairro','omega-cad-complemento'].forEach(function(id){set(id,'');});
    ['omega-cad-cnpj-cep','omega-cad-cnpj-logradouro','omega-cad-cnpj-numero','omega-cad-cnpj-bairro','omega-cad-cnpj-complemento','omega-cad-cnpj-telefone','omega-cad-cnpj-email','omega-cad-cnpj-cpf-socio'].forEach(function(id){set(id,'');});
    ['omega-cad-import-status','omega-drop-cnh-status','omega-drop-endereco-status','omega-drop-cnpj-status','omega-drop-socio-status','omega-cad-status-cpf','omega-cad-status-cnpj'].forEach(function(id){U.clearBox(document.getElementById(id));});
    var r1=document.getElementById('omega-cad-resumo-cpf');if(r1)r1.innerHTML='';
    var r2=document.getElementById('omega-cad-resumo-cnpj');if(r2)r2.innerHTML='';
    // FIX 6: Reset file inputs para limpar arquivo selecionado
    ['omega-drop-cnh-file','omega-drop-endereco-file','omega-drop-cnpj-file','omega-drop-socio-file'].forEach(function(id){var fi=document.getElementById(id);if(fi)fi.value='';});
    var resets={'omega-drop-cnh-txt':'Arraste a CNH ou RG aqui<br><span>Preenche identidade e UF automaticamente</span>','omega-drop-endereco-txt':'Arraste o Comprovante de Endereco aqui<br><span>Opcional — preenche CEP, rua, numero, bairro</span>','omega-drop-cnpj-txt':'Arraste a Inscricao CNPJ / MEI aqui<br><span>Preenche endereco, telefone e email</span>','omega-drop-socio-txt':'Arraste a CNH do Socio aqui<br><span>Opcional — preenche CPF do socio</span>'};
    Object.keys(resets).forEach(function(id){var el=document.getElementById(id);if(el)el.innerHTML=resets[id];});
  }

  document.getElementById('omega-cad-voltar-cpf').addEventListener('click',function(e){e.preventDefault();resetar();});
  document.getElementById('omega-cad-voltar-cnpj').addEventListener('click',function(e){e.preventDefault();resetar();});

  // ═══════════════ RESUMO ═══════════════

  function resumoLinha(label,valor,aleatorio){
    return '<div><span class="om-resumo-label">'+label+':</span> '
      +(aleatorio?'<span class="om-resumo-valor om-resumo-aleatorio">'+valor+' (aleatorio)</span>':'<span class="om-resumo-valor">'+(valor||'—')+'</span>')+'</div>';
  }
  function atualizarResumoCPF(){
    var el=document.getElementById('omega-cad-resumo-cpf');if(!el)return;
    var id=val('omega-cad-identidade'),uf=val('omega-cad-uf'),cep=val('omega-cad-cep'),logr=val('omega-cad-logradouro'),num=val('omega-cad-numero');
    var cepAl=!cep||logr==='0';
    el.innerHTML='<div class="om-resumo"><div class="om-section-title" style="margin-bottom:4px">Resumo</div>'
      +resumoLinha('Identidade',id||'000000',!id)
      +resumoLinha('UF',uf||'—')
      +resumoLinha('Endereco',cep+' / '+(logr||'0')+', '+(num||'0'),cepAl)
      +'</div>';
  }
  function atualizarResumoCNPJ(){
    var el=document.getElementById('omega-cad-resumo-cnpj');if(!el)return;
    var cep=val('omega-cad-cnpj-cep'),logr=val('omega-cad-cnpj-logradouro'),num=val('omega-cad-cnpj-numero');
    var tel=val('omega-cad-cnpj-telefone'),email=val('omega-cad-cnpj-email'),socio=val('omega-cad-cnpj-cpf-socio');
    var cepAl=!cep||logr==='0';
    var telAl=!tel||tel==='0000000000';
    var emailAl=email&&email.indexOf('@yahoo.com')!==-1&&/^[a-z0-9]{10,14}@/.test(email);
    el.innerHTML='<div class="om-resumo"><div class="om-section-title" style="margin-bottom:4px">Resumo</div>'
      +resumoLinha('Endereco',(cep||'—')+' / '+(logr||'0')+', '+(num||'0'),cepAl)
      +resumoLinha('Telefone',tel||'0000000000',telAl)
      +resumoLinha('Email',email||'—',emailAl)
      +resumoLinha('Socio',socio?U.fCPF(socio):'sem socio',!socio)
      +resumoLinha('RT','automatico')
      +'</div>';
  }

  // Listeners de resumo nos campos
  ST(function(){
    ['omega-cad-identidade','omega-cad-uf','omega-cad-cep','omega-cad-logradouro','omega-cad-numero','omega-cad-bairro'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.addEventListener('input',atualizarResumoCPF);
    });
    ['omega-cad-cnpj-cep','omega-cad-cnpj-logradouro','omega-cad-cnpj-numero','omega-cad-cnpj-bairro','omega-cad-cnpj-telefone','omega-cad-cnpj-email','omega-cad-cnpj-cpf-socio'].forEach(function(id){
      var el=document.getElementById(id);if(el)el.addEventListener('input',atualizarResumoCNPJ);
    });
  },150);

  // ═══════════════ BOTAO CPF ═══════════════

  document.getElementById('omega-cad-btn-cpf').addEventListener('click',function(){
    document.getElementById('omega-cad-tipo-btns').style.display='none';
    document.getElementById('omega-cad-form-cpf').style.display='block';
    atualizarResumoCPF();
  });

  ST(function(){
    setupDrop('omega-drop-cnh',function(file){
      var txt=document.getElementById('omega-drop-cnh-txt'),st=document.getElementById('omega-drop-cnh-status');
      txt.innerHTML='📄 '+file.name; U.box(st,true,'Extraindo identidade...');
      EX.extrairCNH(file,function(d){
        set('omega-cad-identidade',d.identidade||'000000');set('omega-cad-uf',(d.uf||'').toUpperCase());
        U.box(st,true,'Identidade: <b>'+(d.identidade||'—')+'</b> | UF: <b>'+(d.uf||'—')+'</b>');
        atualizarResumoCPF();
      },function(err){U.box(st,false,err);});
    });
    setupDrop('omega-drop-endereco',function(file){
      var txt=document.getElementById('omega-drop-endereco-txt'),st=document.getElementById('omega-drop-endereco-status');
      txt.innerHTML='📄 '+file.name; U.box(st,true,'Extraindo endereco...');
      EX.extrairEndereco(file,function(d){
        var cep=(d.cep||'').replace(/\D/g,'');if(!cep)cep=U.cepAleatorio('MG').replace(/\D/g,'');
        set('omega-cad-cep',cep);set('omega-cad-logradouro',d.logradouro||'0');set('omega-cad-numero',d.numero||'0');set('omega-cad-bairro',d.bairro||'0');set('omega-cad-complemento',d.complemento||'');
        U.box(st,true,'CEP: <b>'+cep+'</b> | Rua: <b>'+(d.logradouro||'0')+'</b>');
        atualizarResumoCPF();
      },function(err){
        var cep=U.cepAleatorio('MG').replace(/\D/g,'');
        set('omega-cad-cep',cep);set('omega-cad-logradouro','0');set('omega-cad-numero','0');set('omega-cad-bairro','0');set('omega-cad-complemento','');
        U.box(st,false,err+'<br>Endereco MG aleatorio aplicado.');
        atualizarResumoCPF();
      });
    });
  },100);

  // ═══════════════ BOTAO CNPJ ═══════════════

  document.getElementById('omega-cad-btn-cnpj').addEventListener('click',function(){
    document.getElementById('omega-cad-tipo-btns').style.display='none';
    document.getElementById('omega-cad-form-cnpj').style.display='block';
    atualizarResumoCNPJ();
  });

  ST(function(){
    setupDrop('omega-drop-cnpj',function(file){
      var txt=document.getElementById('omega-drop-cnpj-txt'),st=document.getElementById('omega-drop-cnpj-status');
      txt.innerHTML='📄 '+file.name; U.box(st,true,'Extraindo dados do CNPJ...');
      EX.extrairCNPJ(file,function(d){
        var cep=(d.cep||'').replace(/\D/g,'');if(!cep)cep=U.cepAleatorio('MG').replace(/\D/g,'');
        set('omega-cad-cnpj-cep',cep);set('omega-cad-cnpj-logradouro',d.logradouro||'0');set('omega-cad-cnpj-numero',d.numero||'0');set('omega-cad-cnpj-bairro',d.bairro||'0');set('omega-cad-cnpj-complemento',d.complemento||'');
        var tel=(d.telefone||'').replace(/\D/g,'');if(!tel)tel='0000000000';set('omega-cad-cnpj-telefone',tel);
        var email=(d.email||'').trim();if(!email)email=U.gerarEmail();set('omega-cad-cnpj-email',email);
        U.box(st,true,'CEP: <b>'+cep+'</b> | Tel: <b>'+(tel==='0000000000'?'aleatorio':tel)+'</b> | Email: <b>'+email+'</b>');
        atualizarResumoCNPJ();
      },function(err){
        var cep=U.cepAleatorio('MG').replace(/\D/g,'');
        set('omega-cad-cnpj-cep',cep);set('omega-cad-cnpj-logradouro','0');set('omega-cad-cnpj-numero','0');set('omega-cad-cnpj-bairro','0');set('omega-cad-cnpj-complemento','');
        set('omega-cad-cnpj-telefone','0000000000');set('omega-cad-cnpj-email',U.gerarEmail());
        U.box(st,false,err+'<br>Dados aleatorios aplicados.');
        atualizarResumoCNPJ();
      });
    });
    setupDrop('omega-drop-socio',function(file){
      var txt=document.getElementById('omega-drop-socio-txt'),st=document.getElementById('omega-drop-socio-status');
      txt.innerHTML='📄 '+file.name; U.box(st,true,'Extraindo CPF do socio...');
      EX.extrairCPFSocio(file,function(d){
        var cpf=(d.cpf_socio||'').replace(/\D/g,'');set('omega-cad-cnpj-cpf-socio',cpf);
        U.box(st,true,'CPF Socio: <b>'+(cpf?U.fCPF(cpf):'—')+'</b>');
        atualizarResumoCNPJ();
      },function(err){U.box(st,false,err);});
    });
  },100);

  // ═══════════════ IMPORTAR CODIGO ═══════════════

  document.getElementById('omega-cad-import-btn').addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    var codigo=document.getElementById('omega-cad-import-input').value.trim(),st=document.getElementById('omega-cad-import-status');
    if(!codigo)return U.box(st,false,'Cole o codigo gerado pelo Claude.');
    var d=U.parseCodigo(codigo),tipo=(d.tipo||'').toUpperCase();
    if(tipo!=='CPF'&&tipo!=='CNPJ')return U.box(st,false,'Codigo invalido.');
    document.getElementById('omega-cad-tipo-btns').style.display='none';
    if(tipo==='CPF'){
      document.getElementById('omega-cad-form-cpf').style.display='block';
      document.getElementById('omega-cad-form-cnpj').style.display='none';
      set('omega-cad-identidade',d.identidade);set('omega-cad-uf',(d.uf||'').toUpperCase());
      set('omega-cad-cep',(d.cep||'').replace(/\D/g,''));set('omega-cad-logradouro',d.logradouro);
      set('omega-cad-numero',d.numero);set('omega-cad-complemento',d.complemento);set('omega-cad-bairro',d.bairro);
      atualizarResumoCPF();
    } else {
      document.getElementById('omega-cad-form-cnpj').style.display='block';
      document.getElementById('omega-cad-form-cpf').style.display='none';
      set('omega-cad-cnpj-cep',(d.cep||'').replace(/\D/g,''));set('omega-cad-cnpj-logradouro',d.logradouro);
      set('omega-cad-cnpj-numero',d.numero);set('omega-cad-cnpj-complemento',d.complemento);set('omega-cad-cnpj-bairro',d.bairro);
      set('omega-cad-cnpj-telefone',(d.telefone||'').replace(/\D/g,''));set('omega-cad-cnpj-email',d.email);
      set('omega-cad-cnpj-cpf-socio',(d.cpf_socio||'').replace(/\D/g,''));
      atualizarResumoCNPJ();
    }
    document.getElementById('omega-cad-import-input').value='';
    U.box(st,true,'Dados importados! Confira o resumo e clique em Iniciar.');
  },true);

  // ═══════════════ INICIAR CPF ═══════════════

  document.getElementById('omega-cad-iniciar-cpf').addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    var st=document.getElementById('omega-cad-status-cpf');
    var identidade=val('omega-cad-identidade');
    if(!identidade){U.box(st,false,'Preencha o numero da identidade.');return;}
    if(!U.guardClique(this,60000))return false;
    if(!val('omega-cad-cep')){
      var cep=U.cepAleatorio('MG').replace(/\D/g,'');
      set('omega-cad-cep',cep);set('omega-cad-logradouro','0');set('omega-cad-numero','0');set('omega-cad-bairro','0');
      atualizarResumoCPF();
    }
    U.box(st,true,'Iniciando...');window._omegaAutomacaoAtiva=true;U.matarTimers();
    var uf=val('omega-cad-uf'),cep=val('omega-cad-cep'),logr=val('omega-cad-logradouro'),num=val('omega-cad-numero')||'0',bairro=val('omega-cad-bairro')||'0',compl=val('omega-cad-complemento');
    U.box(st,true,'1/2 — Transportador...');
    preencherTranspCPF(identidade||'000000',uf,function(){ST(function(){U.matarTimers();U.box(st,true,'2/2 — Endereco...');
      preencherEnd(cep,logr,num,bairro,compl,st,function(){window._omegaAutomacaoAtiva=false;U.box(st,true,'Automacao CPF concluida!');});},1200);});
    return false;
  },true);

  // ═══════════════ INICIAR CNPJ ═══════════════

  document.getElementById('omega-cad-iniciar-cnpj').addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    var st=document.getElementById('omega-cad-status-cnpj');
    if(!val('omega-cad-cnpj-cep')){
      var cep=U.cepAleatorio('MG').replace(/\D/g,'');
      set('omega-cad-cnpj-cep',cep);set('omega-cad-cnpj-logradouro','0');set('omega-cad-cnpj-numero','0');set('omega-cad-cnpj-bairro','0');
      atualizarResumoCNPJ();
    }
    if(!val('omega-cad-cnpj-telefone'))set('omega-cad-cnpj-telefone','0000000000');
    if(!val('omega-cad-cnpj-email'))set('omega-cad-cnpj-email',U.gerarEmail());
    if(!U.guardClique(this,60000))return false;
    U.box(st,true,'Iniciando...');window._omegaAutomacaoAtiva=true;U.matarTimers();
    var cep=val('omega-cad-cnpj-cep'),logr=val('omega-cad-cnpj-logradouro'),num=val('omega-cad-cnpj-numero')||'0',bairro=val('omega-cad-cnpj-bairro')||'0',compl=val('omega-cad-cnpj-complemento');
    var tel=val('omega-cad-cnpj-telefone')||'0000000000',email=val('omega-cad-cnpj-email')||U.gerarEmail(),socio=val('omega-cad-cnpj-cpf-socio');
    U.box(st,true,'1/6 — Capacidade financeira...');
    var cb=document.getElementById('TransportadorEtc_SituacaoCapacidadeFinanceira');if(cb)U.marcarICheck(cb);
    ST(function(){U.matarTimers();U.box(st,true,'2/6 — Endereco...');
      preencherEnd(cep,logr,num,bairro,compl,st,function(){ST(function(){U.matarTimers();U.box(st,true,'3/6 — Telefone...');
        // FIX 1: verifica resultado do contato antes de prosseguir
        addContato('2',tel,function(okTel){
          if(!okTel){pararAutomacao(st,'Erro ao adicionar telefone.');return;}
          ST(function(){U.matarTimers();U.box(st,true,'4/6 — Email...');
          addContato('4',email,function(okEmail){
            if(!okEmail){pararAutomacao(st,'Erro ao adicionar email.');return;}
            ST(function(){U.matarTimers();U.box(st,true,'5/6 — Gestor...');
            if(socio){addGestor(socio,st,function(){ST(function(){U.matarTimers();U.box(st,true,'6/6 — RT...');addRT(st,function(){window._omegaAutomacaoAtiva=false;U.box(st,true,'Automacao CNPJ concluida!');});},1500);});}
            else{U.box(st,true,'6/6 — RT (sem gestor)...');addRT(st,function(){window._omegaAutomacaoAtiva=false;U.box(st,false,'RT ok. Gestor sem CPF — adicione manualmente.');});}
          },2000);});},2000);});},1500);});},1200);
    return false;
  },true);

  // ═══════════════ FUNCOES AUTOMACAO ═══════════════
  function preencherTranspCPF(identidade,uf,cb){
    var ci=document.getElementById('TransportadorTac_Identidade')||document.querySelector('input[name="TransportadorTac.Identidade"]')||document.getElementById('Identidade');
    var co=document.getElementById('TransportadorTac_OrgaoEmissor')||document.querySelector('input[name="TransportadorTac.OrgaoEmissor"]')||document.getElementById('OrgaoEmissor');
    var cu=document.getElementById('TransportadorTac_Uf')||document.querySelector('select[name="TransportadorTac.Uf"]')||document.getElementById('UF');
    if(ci){ci.removeAttribute('disabled');ci.removeAttribute('readonly');ci.value=identidade;jqR(ci).trigger('input').trigger('change').trigger('blur');}
    if(co){co.removeAttribute('disabled');co.removeAttribute('readonly');co.value='SSP';jqR(co).trigger('input').trigger('change').trigger('blur');}
    if(cu&&uf){for(var i=0;i<cu.options.length;i++){if(cu.options[i].value===uf||cu.options[i].text===uf){cu.selectedIndex=i;jqR(cu).trigger('change');break;}}}
    cb();
  }
  function preencherEnd(cep,logr,num,bairro,compl,st,cb){
    var btn=document.querySelector('button[data-action*="EnderecoPedido/Novo"]');if(!btn){U.box(st,false,'Botao Endereco nao encontrado.');cb();return;}
    if(!U.guardClique(btn,10000)){cb();return;}btn.click();
    var cf=(cep?cep:U.cepAleatorio('MG')).replace(/\D/g,''),td=!!(cep&&logr&&logr!=='0');
    U.poll(function(){var c=document.getElementById('Cep'),ct=document.getElementById('CodigoTipoEndereco');return(c&&ct&&ct.options.length>1)?{c:c,ct:ct}:null;},function(r){
      // FIX 3: usa selecionarDropdown para CodigoTipoEndereco
      selecionarDropdown(r.ct,'COR');
      U.poll(function(){var ct=document.getElementById('CodigoTipoEndereco');return ct&&ct.value==='COR';},function(){digCEP(document.getElementById('Cep'),cf,td,logr,num,bairro,compl,st,cb);},
        {maxTentativas:10,intervalo:200,onTimeout:function(){digCEP(document.getElementById('Cep'),cf,td,logr,num,bairro,compl,st,cb);}});
    },{maxTentativas:40,intervalo:200,onTimeout:function(){U.box(st,false,'Modal de endereco nao abriu.');cb();}});
  }
  function digCEP(cc,cf,td,logr,num,bairro,compl,st,cb){
    if(!cc){U.box(st,false,'Campo CEP nao encontrado.');cb();return;}
    U.digitarCharAChar(cc,cf,{delay:100,onDone:function(){
      cc.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));cc.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
      var l=document.getElementById('Logradouro');if(l){l.focus();ST(function(){l.blur();},100);}
      U.poll(function(){var l2=document.getElementById('Logradouro');return l2&&l2.value&&l2.value.trim()!=='';},function(){finEnd(td,logr,num,bairro,compl,st,cb);},{maxTentativas:20,intervalo:500,onTimeout:function(){finEnd(td,logr,num,bairro,compl,st,cb);}});}});
  }
  function finEnd(td,logr,num,bairro,compl,st,cb){
    ST(function(){var l=document.getElementById('Logradouro'),n=document.getElementById('Numero'),b=document.getElementById('Bairro'),c=document.getElementById('Complemento');
      if(l){l.value=td?logr:'0';jqR(l).trigger('input').trigger('change');}if(n){n.value=td?(num||'0'):'0';jqR(n).trigger('input').trigger('change');}
      if(b){b.value=td?(bairro||'0'):'0';jqR(b).trigger('input').trigger('change');}if(c&&compl&&td){c.value=compl;jqR(c).trigger('input').trigger('change');}
      ST(function(){var cb2=document.getElementById('MesmoEndereco');if(cb2&&!cb2.checked)U.marcarICheck(cb2);
        ST(function(){var bs=document.querySelector('.btn-salvar-endereco');if(bs&&U.guardClique(bs,5000))bs.click();U.matarTimers();ST(cb,2000);},600);},500);},400);
  }
  function addContato(tv,cv,cb){
    var btn=document.querySelector('button[data-action*="ContatoPedido/Novo"]');if(!btn){cb(false);return;}btn._omegaClicado=false;
    if(!U.guardClique(btn,8000)){cb(false);return;}btn.click();
    ST(function(){var t=document.getElementById('CodigoTipoContato');if(!t){cb(false);return;}
      // FIX: usa selecionarDropdown
      selecionarDropdown(t,tv);
      // Polling com re-tentativa de selecao
      U.poll(function(){
        var a=document.getElementById('CodigoTipoContato');
        if(!a||a.value!==tv){if(a)selecionarDropdown(a,tv);return false;}
        return true;
      },function(){
        // FIX 2: re-busca o campo Contato apos confirmar tipo (DOM pode ter sido recriado)
        ST(function(){var c=document.getElementById('Contato');if(!c){cb(false);return;}
          U.digitarCharAChar(c,cv,{delay:60,onDone:function(){ST(function(){
            var cAtual=document.getElementById('Contato'); // re-busca
            if(!cAtual||!cAtual.value||cAtual.value.trim()===''){U.fecharModal();cb(false);return;}
            var s=document.querySelector('.btn-salvar-contato');if(s&&U.guardClique(s,5000)){s.click();
              ST(function(){var ma=document.querySelector('.modal.show #manterContatoForm');if(ma){U.fecharModal();cb(false);}else{U.matarTimers();ST(function(){cb(true);},1500);}},1500);
            }else if(!s)cb(false);},600);}});},400);
      },{maxTentativas:20,intervalo:300,onTimeout:function(){cb(false);}});},1200);
  }
  function addGestor(cpf,st,cb){
    var fmt=cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
    var btn=document.querySelector('button[data-action*="GestorPedido/Novo"]');if(!btn){document.querySelectorAll('button').forEach(function(el){if(!btn&&el.textContent.trim()==='Adicionar Gestor')btn=el;});}
    if(!btn){U.box(st,false,'Botao Gestor nao encontrado.');cb();return;}if(!U.guardClique(btn,10000)){cb();return;}btn.click();
    U.poll(function(){return document.getElementById('CpfCnpj');},function(){
      // FIX 4: usa selecionarDropdown para CodigoTipoVinculo
      var cf=document.getElementById('CodigoTipoVinculo');if(cf)selecionarDropdown(cf,'1');
      U.poll(function(){var c=document.getElementById('CpfCnpj');return c&&!c.disabled&&!c.readOnly?c:null;},function(c){
        var cf2=document.getElementById('CodigoTipoVinculo');if(cf2&&cf2.value!=='1')selecionarDropdown(cf2,'1');
        U.digitarCharAChar(c,fmt,{delay:80,onDone:function(){U.poll(function(){var n=document.getElementById('Nome');return n&&n.value&&n.value.trim()!=='';},function(){
          U.matarTimers();U.marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
          ST(function(){var bs=document.querySelector('.btn-salvar-gestor');if(bs&&U.guardClique(bs,5000)){bs.removeAttribute('disabled');bs.click();}U.matarTimers();ST(cb,2500);},800);
        },{maxTentativas:30,intervalo:600,onTimeout:function(){U.box(st,false,'Portal nao carregou nome do gestor.');cb();}});}});
      },{maxTentativas:15,intervalo:200,onTimeout:function(){var c2=document.getElementById('CpfCnpj');if(c2)U.digitarCharAChar(c2,fmt,{delay:80,onDone:cb});else{U.box(st,false,'Campo CPF nao encontrado.');cb();}}});
    },{maxTentativas:30,intervalo:200,onTimeout:function(){U.box(st,false,'Modal Gestor nao abriu.');cb();}});
  }
  var CPF_RT='071.417.536-64';
  function addRT(st,cb){
    var btn=document.querySelector('button[data-action*="ResponsavelTecnico/Criar"]');if(!btn){document.querySelectorAll('button').forEach(function(el){if(!btn&&el.textContent.trim()==='Adicionar Responsável Técnico')btn=el;});}
    if(!btn){cb();return;}if(!U.guardClique(btn,10000)){cb();return;}btn.click();
    U.poll(function(){return document.getElementById('Cpf');},function(cpf){cpf.value=CPF_RT;jqR(cpf).trigger('input').trigger('change').trigger('blur');
      U.poll(function(){var n=document.getElementById('Nome');return n&&n.value&&n.value.trim()!=='';},function(){
        U.marcarICheck(document.getElementById('FoiResponsavelTecnico'));U.marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
        ST(function(){var bs=document.getElementById('btnSalvar');if(bs&&U.guardClique(bs,5000)){bs.removeAttribute('disabled');bs.click();}U.matarTimers();ST(cb,2000);},800);
      },{maxTentativas:20,intervalo:600,onTimeout:cb});},{maxTentativas:30,intervalo:200,onTimeout:cb});
  }

  // ── Portal tabs / acoes manuais ─────────────────────────────────
  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab',atualizarSecaoAcoes);link.addEventListener('click',function(){ST(atualizarSecaoAcoes,300);});
  });
  function atualizarSecaoAcoes(){
    var cc=document.querySelector('[data-aba-content="cadastro"]');if(!cc||cc.style.display==='none')return;
    var aba=abaPortalAtiva(),isMov=tipoPedido()==='MovimentacaoFrota';
    var w=document.getElementById('omega-cad-acoes'),co=document.getElementById('omega-cad-contatos'),rt=document.getElementById('omega-cad-rt'),ve=document.getElementById('omega-cad-veiculo');
    if(isMov){w.style.display='block';co.style.display='none';rt.style.display='none';ve.style.display='block';renderHistV();return;}
    var algum=(aba==='#contatos'||aba==='#responsavelTecnico'||aba==='#veiculo');
    w.style.display=algum?'block':'none';co.style.display=aba==='#contatos'?'block':'none';rt.style.display=aba==='#responsavelTecnico'?'block':'none';ve.style.display=aba==='#veiculo'?'block':'none';
    if(aba==='#veiculo')renderHistV();
  }

  // ── CEP manual ──────────────────────────────────────────────────
  function preencherEndMan(estado){
    var st=document.getElementById('omega-cep-status'),cep=U.cepAleatorio(estado);var btn=document.querySelector('button[data-action*="EnderecoPedido/Novo"]');
    if(!btn)return U.box(st,false,'Botao Endereco nao encontrado.');if(!U.guardClique(btn,10000))return;
    U.box(st,true,'Abrindo formulario...');btn.click();var cn=cep.replace(/\D/g,'');
    U.poll(function(){var c=document.getElementById('Cep'),ct=document.getElementById('CodigoTipoEndereco');return(c&&ct&&ct.options.length>1)?{c:c,ct:ct}:null;},function(r){
      selecionarDropdown(r.ct,'COR');
      U.poll(function(){var ct=document.getElementById('CodigoTipoEndereco');return ct&&ct.value==='COR';},function(){
        U.digitarCharAChar(document.getElementById('Cep'),cn,{delay:80,onDone:function(){var cc=document.getElementById('Cep');
          cc.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));cc.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          var l=document.getElementById('Logradouro');if(l){l.focus();ST(function(){l.blur();},100);}U.box(st,true,'CEP '+cep+' inserido...');
          U.poll(function(){var l2=document.getElementById('Logradouro');return l2&&l2.value&&l2.value.trim()!=='';},function(){finEndMan(estado,cep,st);},{maxTentativas:20,intervalo:500,onTimeout:function(){finEndMan(estado,cep,st);}});
        }});},{maxTentativas:10,intervalo:200,onTimeout:function(){U.digitarCharAChar(document.getElementById('Cep'),cn,{delay:80,onDone:function(){finEndMan(estado,cep,st);}});}});
    },{maxTentativas:40,intervalo:200,onTimeout:function(){U.box(st,false,'Modal nao abriu.');}});
  }
  function finEndMan(estado,cep,st){ST(function(){var l=document.getElementById('Logradouro'),n=document.getElementById('Numero'),b=document.getElementById('Bairro');
    if(l){l.value='0';jqR(l).trigger('input').trigger('change');}if(n){n.value='0';jqR(n).trigger('input').trigger('change');}if(b){b.value='0';jqR(b).trigger('input').trigger('change');}
    ST(function(){var cb=document.getElementById('MesmoEndereco');if(cb&&!cb.checked)U.marcarICheck(cb);ST(function(){var bs=document.querySelector('.btn-salvar-endereco');if(bs&&U.guardClique(bs,5000)){bs.click();U.box(st,true,'Endereco ('+estado+'/'+cep+') salvo!');}},600);},500);},300);}

  document.getElementById('omega-cep-mg').addEventListener('click',function(){preencherEndMan('MG');});
  document.getElementById('omega-cep-sp').addEventListener('click',function(){preencherEndMan('SP');});
  document.getElementById('omega-cep-rj').addEventListener('click',function(){preencherEndMan('RJ');});
  document.getElementById('omega-contato-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-contato-status');if(tipoCadastro()==='CPF'){U.box(st,true,'CPF — contatos ja preenchidos pelo portal.');return;}
    U.box(st,true,'Adicionando telefone...');addContato('2','0000000000',function(ok){if(!ok){U.box(st,false,'Erro no telefone.');return;}
      ST(function(){var em=U.gerarEmail();addContato('4',em,function(ok2){if(ok2)U.box(st,true,'Tel + email adicionados!<br><span style="font-size:10px">'+em+'</span>');else U.box(st,false,'Telefone ok, erro no email.');});},2000);});
  });
  document.getElementById('omega-rt-btn').addEventListener('click',function(){var st=document.getElementById('omega-rt-status');addRT(st,function(){U.box(st,true,'RT adicionado! CPF: '+CPF_RT);});});

  // ── Historico veiculos ──────────────────────────────────────────
  function renderHistV(){var lista=U.carregarHistorico(),el=document.getElementById('omega-veiculo-hist'),vz=document.getElementById('omega-veiculo-vazio');if(!el)return;if(lista.length===0){el.innerHTML='';if(vz)vz.style.display='block';return;}if(vz)vz.style.display='none';el.innerHTML=lista.map(function(item,idx){return '<div class="om-hist-item"><div class="om-hist-placa">'+U.formatarPlaca(item.placa||'')+'</div><button onclick="OmegaUsarVeiculoCad('+idx+')" class="om-btn om-btn-blue om-btn-sm">Usar</button></div>';}).join('');}
  function monPopV(st,cb){U.poll(function(){var bb=document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');if(bb&&bb.offsetParent!==null)return{t:'b',btn:bb};var ch=document.getElementById('Chassi');if(ch&&ch.value&&ch.value.trim()!=='')return{t:'c'};return null;},function(r){if(r.t==='c'){cb();return;}U.box(st,true,'Popup! Confirmando em 3s...');ST(function(){r.btn.click();ST(function(){U.poll(function(){var m=document.getElementById('manterVeiculoModal'),t=m?m.querySelector('.modal-title'):null;var e=t&&t.textContent.indexOf('Movimenta')!==-1;var v=m&&(m.style.display==='block'||m.classList.contains('show'));var b=document.querySelector('.btn-confirmar-exclusao');return(e&&v&&b)?b:null;},function(bx){ST(function(){bx.click();ST(function(){var bi=document.querySelector('.btn-confirmar-inclusao');if(bi)bi.click();ST(cb,1500);},1500);},500);},{maxTentativas:15,intervalo:300,onTimeout:cb});},1500);},3000);},{maxTentativas:20,intervalo:300,onTimeout:cb});}
  unsafeWindow.OmegaUsarVeiculoCad=function(idx){var st=document.getElementById('omega-veiculo-status'),lista=U.carregarHistorico(),item=lista[idx];if(!item)return U.box(st,false,'Item nao encontrado.');if(unsafeWindow._omegaVeiculoEmAndamento){U.box(st,false,'Aguarde.');return;}unsafeWindow._omegaVeiculoEmAndamento=true;var lib=function(){unsafeWindow._omegaVeiculoEmAndamento=false;};var isMov=!!document.querySelector('[data-tipo-pedido="MovimentacaoFrota"]'),modal=document.getElementById('manterVeiculoModal'),ab=modal&&(modal.style.display==='block'||modal.classList.contains('show'));var tt=modal?modal.querySelector('.modal-title'):null,ehV=tt&&tt.textContent.indexOf('Dados do Ve')!==-1;function preen(){U.poll(function(){var m=document.getElementById('manterVeiculoModal');var v=m&&(m.style.display==='block'||m.classList.contains('show'));var p=document.getElementById('Placa'),r=document.getElementById('Renavam');return(v&&p&&r)?{p:p,r:r}:null;},function(c){U.box(st,true,'Modal aberto. Preenchendo...');preenV(c.p,c.r,item,st,lib);},{maxTentativas:40,intervalo:200,onTimeout:function(){lib();U.box(st,false,'Modal nao abriu.');}});}function preenV(cp,cr,item,st,lib){var jq=window.OmegaJQ,bv=document.getElementById('verificar'),pv=(item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();cp.removeAttribute('disabled');U.digitarCharAChar(cp,pv,{delay:80,delayEspecial:{4:150},onDone:function(){ST(function(){cr.removeAttribute('disabled');cr.value=item.renavam||'';cr.dispatchEvent(new Event('input',{bubbles:true}));cr.dispatchEvent(new Event('change',{bubbles:true}));cr.dispatchEvent(new Event('blur',{bubbles:true}));ST(function(){if(bv&&U.guardClique(bv,3000)){jq.ajax({type:'GET',url:'/Veiculo/BuscarVeiculo',cache:false,data:{placa:cp.value.toUpperCase(),renavam:cr.value},success:function(){ST(function(){bv.click();},500);},error:function(){ST(function(){bv.click();},500);}});}monPopV(st,function(){var tara=document.getElementById('Tara');if(tara&&(!tara.value||tara.value==='')){tara.removeAttribute('disabled');tara.value='2';jq(tara).trigger('input').trigger('change');}ST(function(){var bs=document.querySelector('.btn-salvar-veiculo')||document.querySelector('.btn-confirmar-inclusao');if(bs&&U.guardClique(bs,5000)){bs.removeAttribute('disabled');bs.click();U.box(st,true,'Veiculo salvo! Placa: <b>'+cp.value+'</b>');}else if(!bs)U.box(st,false,'Botao Salvar nao encontrado.');lib();},800);});},400);},300);}});}if(isMov&&ab&&ehV){U.box(st,true,'Preenchendo...');preen();}else{var ba=document.querySelector('[data-action*="VeiculoPedido/Novo"]');if(!ba){lib();return U.box(st,false,'Botao Adicionar Veiculo nao encontrado.');}if(!U.guardClique(ba,10000)){lib();return;}ba.click();preen();}};

  // Restaurar aba salva
  ST(function(){if(U.restaurarAbaSalva)U.restaurarAbaSalva();},200);
})();
