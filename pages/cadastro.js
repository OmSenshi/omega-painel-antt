// pages/cadastro.js — modulo: Cadastro e Movimentacao de Frota
(function(){
  var U   = window.OmegaUtils;
  var jq  = window.OmegaJQ;
  var jqR = unsafeWindow.jQuery || unsafeWindow.$;

  // Helper: setTimeout seguro (nao cancelado pelo OmegaMatarTimers)
  function ST(fn, ms){ return window._setTimeoutNativo ? window._setTimeoutNativo(fn, ms) : setTimeout(fn, ms); }
  // Helper: matar timers do portal e fechar toasts
  function matarTimers(){
    if(window.OmegaMatarTimers) window.OmegaMatarTimers();
    // Fecha todos os toasts visiveis clicando no X
    document.querySelectorAll('.toast-close-button').forEach(function(btn){ try{btn.click();}catch(e){} });
  }

  var CEPS = {
    MG: ['32220-390','32017-900','32280-370'],
    SP: ['04805-140','01002-900','08062-700'],
    RJ: ['23032-486','20211-110','22793-620']
  };

  function cepAleatorio(e){ var l=CEPS[e]||CEPS.MG; return l[Math.floor(Math.random()*l.length)]; }
  function abaPortalAtiva(){ var t=document.querySelector('.nav-tabs .nav-link.active'); return t?t.getAttribute('href'):''; }
  function tipoPedido(){ var el=document.querySelector('.main_content'); return el?(el.getAttribute('data-tipo-pedido')||''):''; }
  function tipoCadastro(){ var c=document.getElementById('CpfCnpjTransportador'); if(!c||!c.value)return'CPF'; return c.value.replace(/\D/g,'').length===14?'CNPJ':'CPF'; }
  function gerarEmail(){ var c='abcdefghijklmnopqrstuvwxyz0123456789',s=''; for(var i=0;i<12;i++) s+=c[Math.floor(Math.random()*c.length)]; return s+'@yahoo.com'; }

  // ── ABA: CADASTRO ───────────────────────────────────────────────
  U.registrarAba('cadastro', 'Cadastro', ''
    +'<div style="display:flex;gap:6px;margin-bottom:8px">'
      +'<input id="omega-cad-import-input" placeholder="Cole o codigo OMEGA Cadastro aqui" style="flex:1;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:11px;box-sizing:border-box">'
      +'<button type="button" id="omega-cad-import-btn" style="padding:6px 10px;background:#f1a9a0;color:#fff;border:none;border-radius:7px;font-size:11px;cursor:pointer;font-weight:bold;white-space:nowrap">Importar</button>'
    +'</div>'
    +'<div id="omega-cad-import-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:6px"></div>'
    +'<div id="omega-cad-campos" style="display:none">'
      +'<div id="omega-cad-tipo-badge" style="font-size:11px;font-weight:bold;color:#fff;background:#1a73e8;border-radius:6px;padding:3px 8px;display:inline-block;margin-bottom:8px"></div>'
      +'<div id="omega-cad-sec-id" style="display:none">'
        +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Identidade / CNH</div>'
        +'<div style="display:grid;grid-template-columns:2fr 1fr;gap:6px;margin-bottom:6px">'
          +'<div><label style="font-size:10px;color:#888">Numero</label><input id="omega-cad-identidade" placeholder="000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'<div><label style="font-size:10px;color:#888">UF</label><input id="omega-cad-uf" placeholder="MG" maxlength="2" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box;text-transform:uppercase"></div>'
        +'</div>'
      +'</div>'
      +'<div id="omega-cad-sec-end" style="display:none">'
        +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Endereco</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
          +'<div><label style="font-size:10px;color:#888">CEP</label><input id="omega-cad-cep" placeholder="00000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'<div><label style="font-size:10px;color:#888">Numero</label><input id="omega-cad-numero" placeholder="0" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
        +'</div>'
        +'<div style="margin-bottom:5px"><label style="font-size:10px;color:#888">Logradouro</label><input id="omega-cad-logradouro" placeholder="Nome da rua" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
          +'<div><label style="font-size:10px;color:#888">Bairro</label><input id="omega-cad-bairro" placeholder="Bairro" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'<div><label style="font-size:10px;color:#888">Complemento</label><input id="omega-cad-complemento" placeholder="Apto..." style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
        +'</div>'
      +'</div>'
      +'<div id="omega-cad-sec-cont" style="display:none">'
        +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Contato</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
          +'<div><label style="font-size:10px;color:#888">Telefone</label><input id="omega-cad-telefone" placeholder="0000000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'<div><label style="font-size:10px;color:#888">Email</label><input id="omega-cad-email" placeholder="email@exemplo.com" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
        +'</div>'
      +'</div>'
      +'<div id="omega-cad-sec-soc" style="display:none">'
        +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Gestor / Socio</div>'
        +'<div style="margin-bottom:6px"><label style="font-size:10px;color:#888">CPF do Socio</label><input id="omega-cad-cpf-socio" placeholder="00000000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
      +'</div>'
      +'<button type="button" id="omega-cad-iniciar-btn" style="width:100%;padding:9px;background:#34a853;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold;margin-top:2px">&#9654; Iniciar Automacao</button>'
      +'<div id="omega-cad-iniciar-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-top:5px"></div>'
    +'</div>'
    +'<div id="omega-cad-acoes" style="display:none">'
      +'<hr style="margin:10px 0;border:none;border-top:1px solid #eee">'
      +'<div id="omega-cad-contatos" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Endereco</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">'
          +'<button id="omega-cep-mg" style="padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">MG</button>'
          +'<button id="omega-cep-sp" style="padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">SP</button>'
          +'<button id="omega-cep-rj" style="padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">RJ</button>'
        +'</div>'
        +'<div id="omega-cep-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:8px"></div>'
        +'<hr style="margin:8px 0;border:none;border-top:1px solid #eee">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Contato</div>'
        +'<button id="omega-contato-btn" style="width:100%;padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar Telefone + Email</button>'
        +'<div id="omega-contato-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'
      +'<div id="omega-cad-rt" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Responsavel Tecnico</div>'
        +'<button id="omega-rt-btn" style="width:100%;padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar RT</button>'
        +'<div id="omega-rt-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'
      +'<div id="omega-cad-veiculo" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Veiculo</div>'
        +'<div id="omega-veiculo-hist" style="max-height:180px;overflow-y:auto;margin-bottom:6px"></div>'
        +'<div id="omega-veiculo-vazio" style="font-size:11px;color:#aaa;text-align:center;padding:8px 0">Nenhum veiculo no historico</div>'
        +'<div id="omega-veiculo-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'
    +'</div>'
  , function(){ atualizarSecaoAcoes(); });

  // ── Listeners abas do portal ────────────────────────────────────
  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab', atualizarSecaoAcoes);
    link.addEventListener('click', function(){ setTimeout(atualizarSecaoAcoes, 300); });
  });

  function atualizarSecaoAcoes() {
    var conteudoCad = document.querySelector('[data-aba-content="cadastro"]');
    if(!conteudoCad || conteudoCad.style.display === 'none') return;
    var aba = abaPortalAtiva();
    var isMovimentacao = tipoPedido() === 'MovimentacaoFrota';
    var wrapper = document.getElementById('omega-cad-acoes');
    var cont    = document.getElementById('omega-cad-contatos');
    var rt      = document.getElementById('omega-cad-rt');
    var veiculo = document.getElementById('omega-cad-veiculo');
    if(isMovimentacao){
      wrapper.style.display='block'; cont.style.display='none'; rt.style.display='none'; veiculo.style.display='block';
      renderHistoricoVeiculo(); return;
    }
    var algum=(aba==='#contatos'||aba==='#responsavelTecnico'||aba==='#veiculo');
    wrapper.style.display = algum?'block':'none';
    cont.style.display    = aba==='#contatos'?'block':'none';
    rt.style.display      = aba==='#responsavelTecnico'?'block':'none';
    veiculo.style.display = aba==='#veiculo'?'block':'none';
    if(aba==='#veiculo') renderHistoricoVeiculo();
  }

  // ── Importar codigo ─────────────────────────────────────────────
  document.getElementById('omega-cad-import-btn').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var codigo = document.getElementById('omega-cad-import-input').value.trim();
    var st     = document.getElementById('omega-cad-import-status');
    if(!codigo) return U.box(st, false, 'Cole o codigo gerado pelo Claude.');
    var dados = {};
    codigo.split('|').forEach(function(par){
      var idx=par.indexOf('=');
      if(idx!==-1) dados[par.substring(0,idx).trim()]=par.substring(idx+1).trim();
    });
    var tipo=(dados.tipo||'').toUpperCase();
    if(tipo!=='CPF'&&tipo!=='CNPJ') return U.box(st,false,'Codigo invalido.');
    document.getElementById('omega-cad-tipo-badge').textContent=tipo==='CPF'?'Cadastro CPF':'Cadastro CNPJ';
    document.getElementById('omega-cad-sec-id').style.display   =tipo==='CPF' ?'block':'none';
    document.getElementById('omega-cad-sec-cont').style.display =tipo==='CNPJ'?'block':'none';
    document.getElementById('omega-cad-sec-soc').style.display  =tipo==='CNPJ'?'block':'none';
    document.getElementById('omega-cad-sec-end').style.display  ='block';
    function set(id,val){var el=document.getElementById(id);if(el)el.value=val||'';}
    set('omega-cad-identidade', dados.identidade);
    set('omega-cad-uf',         (dados.uf||'').toUpperCase());
    set('omega-cad-cep',        (dados.cep||'').replace(/\D/g,''));
    set('omega-cad-logradouro', dados.logradouro);
    set('omega-cad-numero',     dados.numero);
    set('omega-cad-complemento',dados.complemento);
    set('omega-cad-bairro',     dados.bairro);
    set('omega-cad-telefone',   (dados.telefone||'').replace(/\D/g,''));
    set('omega-cad-email',      dados.email);
    set('omega-cad-cpf-socio',  (dados.cpf_socio||'').replace(/\D/g,''));
    document.getElementById('omega-cad-campos').style.display='block';
    document.getElementById('omega-cad-import-input').value='';
    U.box(st,true,'Dados importados! Confira e clique em Iniciar.');
  }, true);

  // ── Iniciar ─────────────────────────────────────────────────────
  document.getElementById('omega-cad-iniciar-btn').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    var st=document.getElementById('omega-cad-iniciar-status');
    if(this._omegaClicado) return false;
    this._omegaClicado=true;
    var self=this; ST(function(){self._omegaClicado=false;}, 60000);
    var tipo=document.getElementById('omega-cad-tipo-badge').textContent.indexOf('CNPJ')!==-1?'CNPJ':'CPF';
    U.box(st,true,'Iniciando...');
    window._omegaAutomacaoAtiva=true;
    matarTimers();
    if(tipo==='CPF') iniciarCPF(st); else iniciarCNPJ(st);
    return false;
  }, true);

  // ════════════════════════════════════════════════════════════════
  // AUTOMACAO CPF:
  // 1) Transportador (Identidade + OrgaoEmissor=SSP + UF)
  // 2) Endereco (COR + MesmoEndereco)
  // 3) RT
  // ════════════════════════════════════════════════════════════════
  function iniciarCPF(st) {
    var identidade  = document.getElementById('omega-cad-identidade').value.trim()||'000000';
    var uf          = document.getElementById('omega-cad-uf').value.trim().toUpperCase();
    var cep         = document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro  = document.getElementById('omega-cad-logradouro').value.trim();
    var numero      = document.getElementById('omega-cad-numero').value.trim()||'0';
    var bairro      = document.getElementById('omega-cad-bairro').value.trim()||'0';
    var complemento = document.getElementById('omega-cad-complemento').value.trim();

    U.box(st,true,'1/3 — Transportador...');
    preencherTransportadorCPF(identidade, uf, function(){
      ST(function(){
        matarTimers();
        U.box(st,true,'2/3 — Endereco...');
        preencherEndereco(cep,logradouro,numero,bairro,complemento,st,function(){
          ST(function(){
            matarTimers();
            U.box(st,true,'3/3 — RT...');
            adicionarRT(st,function(){
              window._omegaAutomacaoAtiva=false;
              U.box(st,true,'Automacao CPF concluida!');
            });
          },1500);
        });
      },1200);
    });
  }

  // ════════════════════════════════════════════════════════════════
  // AUTOMACAO CNPJ:
  // 1) Capacidade financeira
  // 2) Endereco (COR + MesmoEndereco)
  // 3) Contato telefone
  // 4) Contato email
  // 5) Gestor/Socio
  // 6) RT
  // ════════════════════════════════════════════════════════════════
  function iniciarCNPJ(st) {
    var cep         = document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro  = document.getElementById('omega-cad-logradouro').value.trim();
    var numero      = document.getElementById('omega-cad-numero').value.trim()||'0';
    var bairro      = document.getElementById('omega-cad-bairro').value.trim()||'0';
    var complemento = document.getElementById('omega-cad-complemento').value.trim();
    var telefone    = document.getElementById('omega-cad-telefone').value.replace(/\D/g,'')||'0000000000';
    var email       = document.getElementById('omega-cad-email').value.trim()||gerarEmail();
    var cpfSocio    = document.getElementById('omega-cad-cpf-socio').value.replace(/\D/g,'');

    U.box(st,true,'1/6 — Capacidade financeira...');
    var cbCap=document.getElementById('TransportadorEtc_SituacaoCapacidadeFinanceira');
    if(cbCap){try{jqR(cbCap).iCheck('check');}catch(e){} cbCap.checked=true; jqR(cbCap).trigger('ifChecked').trigger('change');}

    ST(function(){
      matarTimers();
      U.box(st,true,'2/6 — Endereco...');
      preencherEndereco(cep,logradouro,numero,bairro,complemento,st,function(){
        ST(function(){
          matarTimers();
          U.box(st,true,'3/6 — Telefone...');
          adicionarContato('2',telefone,function(){
            ST(function(){
              matarTimers();
              U.box(st,true,'4/6 — Email...');
              adicionarContato('4',email,function(){
                ST(function(){
                  matarTimers();
                  U.box(st,true,'5/6 — Gestor...');
                  if(cpfSocio){
                    adicionarGestor(cpfSocio,st,function(){
                      ST(function(){
                        matarTimers();
                        U.box(st,true,'6/6 — RT...');
                        adicionarRT(st,function(){
                          window._omegaAutomacaoAtiva=false;
                          U.box(st,true,'Automacao CNPJ concluida!');
                        });
                      },1500);
                    });
                  } else {
                    U.box(st,true,'6/6 — RT (sem gestor)...');
                    adicionarRT(st,function(){
                      window._omegaAutomacaoAtiva=false;
                      U.box(st,false,'RT ok. Gestor sem CPF — adicione manualmente.');
                    });
                  }
                },2000);
              });
            },2000);
          });
        },1500);
      });
    },1200);
  }

  // ════════════════════════════════════════════════════════════════
  // FUNCOES DE AUTOMACAO
  // ════════════════════════════════════════════════════════════════

  // ── Transportador CPF ───────────────────────────────────────────
  function preencherTransportadorCPF(identidade, uf, callback) {
    var ci = document.getElementById('TransportadorTac_Identidade')  || document.querySelector('input[name="TransportadorTac.Identidade"]')  || document.getElementById('Identidade');
    var co = document.getElementById('TransportadorTac_OrgaoEmissor') || document.querySelector('input[name="TransportadorTac.OrgaoEmissor"]') || document.getElementById('OrgaoEmissor');
    var cu = document.getElementById('TransportadorTac_Uf')           || document.querySelector('select[name="TransportadorTac.Uf"]')           || document.getElementById('UF');
    if(ci){ ci.removeAttribute('disabled'); ci.removeAttribute('readonly'); ci.value=identidade; jqR(ci).trigger('input').trigger('change').trigger('blur'); }
    if(co){ co.removeAttribute('disabled'); co.removeAttribute('readonly'); co.value='SSP';       jqR(co).trigger('input').trigger('change').trigger('blur'); }
    if(cu && uf){
      for(var i=0;i<cu.options.length;i++){
        if(cu.options[i].value===uf||cu.options[i].text===uf){ cu.selectedIndex=i; jqR(cu).trigger('change'); break; }
      }
    }
    callback();
  }

  // ── Endereco (uma unica vez, COR + MesmoEndereco) ───────────────
  function preencherEndereco(cep,logradouro,numero,bairro,complemento,st,callback) {
    var btn=document.querySelector('button[data-action*="EnderecoPedido/Novo"]');
    if(!btn){ U.box(st,false,'Botao Endereco nao encontrado.'); callback(); return; }
    if(btn._omegaClicado){ callback(); return; }
    btn._omegaClicado=true;
    ST(function(){ btn._omegaClicado=false; }, 10000);
    btn.click();

    ST(function(){
      var campoCep=document.getElementById('Cep');
      if(!campoCep){ U.box(st,false,'Modal de endereco nao abriu.'); callback(); return; }
      var cepFinal=(cep?cep:cepAleatorio('MG')).replace(/\D/g,'');
      var temDados=!!(cep&&logradouro&&logradouro!=='0');

      // Aguarda dropdown de tipo carregar — ST recursivo (seguro contra matarTimers)
      var tentTipo=0;
      function pollTipo(){
        tentTipo++;
        var ct=document.getElementById('CodigoTipoEndereco');
        if(ct&&ct.options.length>1){
          ct.value='COR';
          ct.selectedIndex=Array.from(ct.options).findIndex(function(o){return o.value==='COR';});
          jqR(ct).trigger('change');
        } else if(tentTipo<15){
          ST(pollTipo,200);
        }
      }
      pollTipo();

      // Digita CEP
      ST(function(){
        campoCep.value=''; campoCep.focus(); campoCep.dispatchEvent(new Event('focus',{bubbles:true}));
        var i=0;
        function proxChar(){
          if(i>=cepFinal.length){
            campoCep.dispatchEvent(new Event('input',{bubbles:true}));
            campoCep.dispatchEvent(new Event('change',{bubbles:true}));
            campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));
            campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
            campoCep.dispatchEvent(new Event('blur',{bubbles:true}));
            var l=document.getElementById('Logradouro');
            if(l){l.focus(); ST(function(){l.blur();},100);}
            // Aguarda logradouro carregar — ST recursivo
            var tentLog=0;
            function pollLog(){
              tentLog++;
              var l2=document.getElementById('Logradouro');
              if((l2&&l2.value&&l2.value.trim()!=='')||tentLog>=20){
                ST(function(){
                  var l3=document.getElementById('Logradouro'),n3=document.getElementById('Numero'),b3=document.getElementById('Bairro'),c3=document.getElementById('Complemento');
                  if(l3){l3.value=temDados?logradouro:'0'; jqR(l3).trigger('input').trigger('change');}
                  if(n3){n3.value=temDados?(numero||'0'):'0'; jqR(n3).trigger('input').trigger('change');}
                  if(b3){b3.value=temDados?(bairro||'0'):'0'; jqR(b3).trigger('input').trigger('change');}
                  if(c3&&complemento&&temDados){c3.value=complemento; jqR(c3).trigger('input').trigger('change');}
                  ST(function(){
                    // Marca MesmoEndereco
                    var cb=document.getElementById('MesmoEndereco');
                    if(cb&&!cb.checked){ try{jqR(cb).iCheck('check');}catch(e){} cb.checked=true; jqR(cb).trigger('ifChecked').trigger('change'); }
                    ST(function(){
                      var btnS=document.querySelector('.btn-salvar-endereco');
                      if(btnS&&!btnS._omegaClicado){
                        btnS._omegaClicado=true; btnS.click();
                        ST(function(){btnS._omegaClicado=false;},5000);
                      }
                      matarTimers();
                      ST(callback,2000);
                    },600);
                  },500);
                },400);
              } else {
                ST(pollLog,500);
              }
            }
            pollLog();
            return;
          }
          var ch=cepFinal[i]; campoCep.value+=ch;
          campoCep.dispatchEvent(new Event('input',{bubbles:true}));
          campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
          i++; ST(proxChar,100);
        }
        proxChar();
      },500);
    },1500);
  }

  // ── Contato (telefone OU email — chamado separadamente) ─────────
  function adicionarContato(tipoVal,contatoVal,callback){
    var btn=document.querySelector('button[data-action*="ContatoPedido/Novo"]');
    if(!btn){ callback(false); return; }
    // Reseta flag se ainda ativa de chamada anterior
    if(btn._omegaClicado){ btn._omegaClicado=false; }
    btn._omegaClicado=true;
    ST(function(){btn._omegaClicado=false;},8000);
    btn.click();
    ST(function(){
      var t=document.getElementById('CodigoTipoContato');
      if(!t){ callback(false); return; }
      // Seleciona o tipo
      t.value=tipoVal; jqR(t).trigger('change');
      ST(function(){
        // Confirma tipo e re-busca campo (portal pode substituir o input ao mudar tipo)
        t.value=tipoVal; jqR(t).trigger('change');
        ST(function(){
          // Re-busca referencia ao campo apos mudanca de tipo
          var c=document.getElementById('Contato');
          if(!c){ callback(false); return; }
          c.value=''; c.focus(); c.click();
          c.dispatchEvent(new Event('focus',{bubbles:true}));
          var chars=contatoVal.split(''),i=0;
          function proxChar(){
            if(i>=chars.length){
              // Re-busca novamente antes de verificar valor
              c=document.getElementById('Contato');
              c.dispatchEvent(new Event('change',{bubbles:true}));
              c.dispatchEvent(new Event('blur',{bubbles:true}));
              ST(function(){
                // Verifica se campo tem valor antes de salvar
                c=document.getElementById('Contato');
                if(!c||!c.value||c.value.trim()===''){
                  // Campo vazio — fecha modal e reporta erro
                  var btnFechar=document.querySelector('#manterContatoForm .close, .modal.show .close, .modal.show [data-dismiss="modal"]');
                  if(btnFechar) btnFechar.click();
                  // Remove backdrop se ficou preso
                  ST(function(){
                    document.querySelectorAll('.modal-backdrop').forEach(function(el){el.remove();});
                    document.body.classList.remove('modal-open');
                  },300);
                  callback(false);
                  return;
                }
                var s=document.querySelector('.btn-salvar-contato');
                if(s&&!s._omegaClicado){
                  s._omegaClicado=true; s.click();
                  ST(function(){s._omegaClicado=false;},5000);
                  // Verifica se modal fechou (sucesso) ou ficou aberto (erro de validacao)
                  ST(function(){
                    var modalAberto=document.querySelector('#manterContatoForm');
                    var visivel=modalAberto&&(modalAberto.closest('.modal.show')||document.querySelector('.modal.show #manterContatoForm'));
                    if(visivel){
                      // Modal ainda aberto = erro de validacao — fecha e reporta
                      var btnFechar2=document.querySelector('.modal.show .close, .modal.show [data-dismiss="modal"]');
                      if(btnFechar2) btnFechar2.click();
                      ST(function(){
                        document.querySelectorAll('.modal-backdrop').forEach(function(el){el.remove();});
                        document.body.classList.remove('modal-open');
                      },300);
                      callback(false);
                    } else {
                      matarTimers();
                      ST(function(){callback(true);},1500);
                    }
                  },1500);
                } else if(!s) callback(false);
              },600);
              return;
            }
            // Re-busca campo a cada caractere (previne referencia stale)
            c=document.getElementById('Contato');
            var ch=chars[i]; c.value+=ch;
            c.dispatchEvent(new Event('input',{bubbles:true}));
            c.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
            i++; ST(proxChar,60);
          }
          proxChar();
        },600); // delay maior apos confirmacao do tipo
      },500);
    },1200);
  }

  // ── Gestor/Socio ────────────────────────────────────────────────
  function adicionarGestor(cpfSocio,st,callback){
    var cpfFmt=cpfSocio.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
    var btn=document.querySelector('button[data-action*="GestorPedido/Novo"]');
    if(!btn){ document.querySelectorAll('button').forEach(function(el){ if(!btn&&el.textContent.trim()==='Adicionar Gestor')btn=el; }); }
    if(!btn){ U.box(st,false,'Botao Gestor nao encontrado — adicione manualmente.'); callback(); return; }
    if(btn._omegaClicado){ callback(); return; }
    btn._omegaClicado=true;
    ST(function(){btn._omegaClicado=false;},10000);
    btn.click();

    ST(function(){
      var campoFunc=document.getElementById('CodigoTipoVinculo');
      var campoCPF=document.getElementById('CpfCnpj');
      if(!campoCPF){ U.box(st,false,'Modal Gestor nao abriu.'); callback(); return; }
      // Seleciona Socio sem trigger (evita erro AjustaFormularioTipoFuncao)
      if(campoFunc) campoFunc.value='1';
      // Aguarda campo estabilizar
      ST(function(){
        if(campoFunc&&campoFunc.value!=='1') campoFunc.value='1';
        campoCPF=document.getElementById('CpfCnpj');
        if(!campoCPF){ U.box(st,false,'Campo CPF nao encontrado.'); callback(); return; }
        campoCPF.value=''; campoCPF.focus(); campoCPF.click();
        campoCPF.dispatchEvent(new Event('focus',{bubbles:true}));
        ST(function(){
          // Digita CPF char a char
          var chars=cpfFmt.split(''),i=0;
          function proxChar(){
            if(i>=chars.length){
              campoCPF.dispatchEvent(new Event('change',{bubbles:true}));
              campoCPF.dispatchEvent(new Event('blur',{bubbles:true}));
              // Aguarda portal carregar o nome via AJAX — matarTimers so apos resposta
              var tent=0;
              function pollNomeGestor(){
                tent++;
                var nome=document.getElementById('Nome');
                var btnS=document.querySelector('.btn-salvar-gestor');
                if(nome&&nome.value&&nome.value.trim()!==''){
                  // Nome carregado — agora mata timers e salva
                  matarTimers();
                  var cb=document.getElementById('isDeclaracaoIdoneoArtigo2');
                  if(cb){ try{jqR(cb).iCheck('check');}catch(e){} cb.checked=true; jqR(cb).trigger('ifChecked').trigger('change'); }
                  ST(function(){
                    if(btnS&&!btnS._omegaClicado){
                      btnS._omegaClicado=true; btnS.removeAttribute('disabled'); btnS.click();
                      ST(function(){btnS._omegaClicado=false;},5000);
                    }
                    matarTimers();
                    ST(callback,2500);
                  },800);
                } else if(tent>30){
                  // Timeout — portal nao respondeu
                  U.box(st,false,'Portal nao carregou nome do gestor. Verifique o CPF.');
                  callback();
                } else {
                  ST(pollNomeGestor, 600);
                }
              }
              pollNomeGestor();
              return;
            }
            var ch=chars[i]; campoCPF.value+=ch;
            campoCPF.dispatchEvent(new Event('input',{bubbles:true}));
            campoCPF.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
            i++; ST(proxChar,80);
          }
          proxChar();
        },300);
      },1200);
    },1500);
  }

  // ── RT ───────────────────────────────────────────────────────────
  var CPF_RT='071.417.536-64';
  function adicionarRT(st,callback){
    var btn=document.querySelector('button[data-action*="ResponsavelTecnico/Criar"]');
    if(!btn){ document.querySelectorAll('button').forEach(function(el){ if(!btn&&el.textContent.trim()==='Adicionar Responsável Técnico')btn=el; }); }
    if(!btn){ callback(); return; }
    if(btn._omegaClicado){ callback(); return; }
    btn._omegaClicado=true;
    ST(function(){btn._omegaClicado=false;},10000);
    btn.click();
    ST(function(){
      var cpf=document.getElementById('Cpf');
      if(!cpf){ callback(); return; }
      cpf.value=CPF_RT; jqR(cpf).trigger('input').trigger('change').trigger('blur');
      var tent=0;
      function pollNomeRT(){
        tent++;
        var nome=document.getElementById('Nome'),btnS=document.getElementById('btnSalvar');
        if((nome&&nome.value&&nome.value.trim()!=='')||tent>20){
          if(!nome||!nome.value){ callback(); return; }
          function marcarICheck(cb){ if(!cb)return; try{jqR(cb).iCheck('check');}catch(e){} cb.checked=true; jqR(cb).trigger('ifChecked').trigger('change'); }
          marcarICheck(document.getElementById('FoiResponsavelTecnico'));
          marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
          ST(function(){
            if(btnS&&!btnS._omegaClicado){
              btnS._omegaClicado=true; btnS.removeAttribute('disabled'); btnS.click();
              ST(function(){btnS._omegaClicado=false;},5000);
            }
            matarTimers();
            ST(callback,2000);
          },800);
        } else {
          ST(pollNomeRT, 600);
        }
      }
      pollNomeRT();
    },1500);
  }

  // ── CEP manual (aba Acoes) ──────────────────────────────────────
  function preencherEnderecoManual(estado){
    var st=document.getElementById('omega-cep-status'),cep=cepAleatorio(estado);
    var btn=document.querySelector('button[data-action*="EnderecoPedido/Novo"]');
    if(!btn) return U.box(st,false,'Botao Endereco nao encontrado.');
    if(btn._omegaClicado) return;
    btn._omegaClicado=true; ST(function(){btn._omegaClicado=false;},10000);
    U.box(st,true,'Abrindo formulario...'); btn.click();
    ST(function(){
      var campoCep=document.getElementById('Cep');
      if(!campoCep) return U.box(st,false,'Modal nao abriu.');
      var tentTipo2=0;
      function pollTipo2(){
        tentTipo2++;
        var ct=document.getElementById('CodigoTipoEndereco');
        if(ct&&ct.options.length>1){ ct.value='COR'; ct.selectedIndex=Array.from(ct.options).findIndex(function(o){return o.value==='COR';}); jqR(ct).trigger('change'); }
        else if(tentTipo2<15){ ST(pollTipo2,200); }
      }
      pollTipo2();
      var cepN=cep.replace(/\D/g,''); campoCep.value=''; campoCep.focus(); campoCep.dispatchEvent(new Event('focus',{bubbles:true}));
      var i=0;
      function proxChar(){
        if(i>=cepN.length){
          campoCep.dispatchEvent(new Event('input',{bubbles:true})); campoCep.dispatchEvent(new Event('change',{bubbles:true}));
          campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9})); campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new Event('blur',{bubbles:true}));
          var l=document.getElementById('Logradouro'); if(l){l.focus();ST(function(){l.blur();},100);}
          U.box(st,true,'CEP '+cep+' inserido...');
          var tentLog2=0;
          function pollLog2(){
            tentLog2++;
            var l2=document.getElementById('Logradouro');
            if((l2&&l2.value&&l2.value.trim()!=='')||tentLog2>=20){
              ST(function(){
                var l3=document.getElementById('Logradouro'),n3=document.getElementById('Numero'),b3=document.getElementById('Bairro');
                if(l3){l3.value='0';jqR(l3).trigger('input').trigger('change');}
                if(n3){n3.value='0';jqR(n3).trigger('input').trigger('change');}
                if(b3){b3.value='0';jqR(b3).trigger('input').trigger('change');}
                ST(function(){
                  var cb=document.getElementById('MesmoEndereco');
                  if(cb&&!cb.checked){ try{jqR(cb).iCheck('check');}catch(e){} cb.checked=true; jqR(cb).trigger('ifChecked').trigger('change'); }
                  ST(function(){
                    var btnS=document.querySelector('.btn-salvar-endereco');
                    if(btnS&&!btnS._omegaClicado){
                      btnS._omegaClicado=true; btnS.click();
                      U.box(st,true,'Endereco ('+estado+'/'+cep+') salvo!');
                      ST(function(){btnS._omegaClicado=false;},5000);
                    }
                  },600);
                },500);
              },300);
            } else { ST(pollLog2,500); }
          }
          pollLog2();
          return;
        }
        var ch=cepN[i]; campoCep.value+=ch;
        campoCep.dispatchEvent(new Event('input',{bubbles:true})); campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++; ST(proxChar,80);
      }
      proxChar();
    },1500);
  }

  document.getElementById('omega-cep-mg').addEventListener('click',function(){preencherEnderecoManual('MG');});
  document.getElementById('omega-cep-sp').addEventListener('click',function(){preencherEnderecoManual('SP');});
  document.getElementById('omega-cep-rj').addEventListener('click',function(){preencherEnderecoManual('RJ');});

  // ── Contato manual (aba Acoes) ──────────────────────────────────
  document.getElementById('omega-contato-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-contato-status');
    if(tipoCadastro()==='CPF'){U.box(st,true,'CPF — contatos ja preenchidos pelo portal.');return;}
    U.box(st,true,'Adicionando telefone...');
    adicionarContato('2','0000000000',function(ok){
      if(!ok){U.box(st,false,'Erro no telefone.');return;}
      ST(function(){
        var email=gerarEmail();
        adicionarContato('4',email,function(ok2){
          if(ok2) U.box(st,true,'Tel + email adicionados!<br><span style="font-size:10px">'+email+'</span>');
          else U.box(st,false,'Telefone ok, erro no email.');
        });
      },2000);
    });
  });

  // ── RT manual (aba Acoes) ───────────────────────────────────────
  document.getElementById('omega-rt-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-rt-status');
    adicionarRT(st,function(){U.box(st,true,'RT adicionado! CPF: '+CPF_RT);});
  });

  // ── Historico de veiculos ───────────────────────────────────────
  var HIST_KEY='omega_historico';
  function carregarHistorico(){try{var raw=(typeof GM_getValue!=='undefined')?GM_getValue(HIST_KEY,'[]'):localStorage.getItem(HIST_KEY)||'[]';return JSON.parse(raw).filter(function(i){return(Date.now()-i.ts)<86400000;});}catch(e){return[];}}

  function renderHistoricoVeiculo(){
    var lista=carregarHistorico(),el=document.getElementById('omega-veiculo-hist'),vazio=document.getElementById('omega-veiculo-vazio');
    if(!el)return;
    if(lista.length===0){el.innerHTML='';if(vazio)vazio.style.display='block';return;}
    if(vazio)vazio.style.display='none';
    el.innerHTML=lista.map(function(item,idx){
      var p=item.placa||'',display=/^[A-Z]{3}[0-9]{4}$/.test(p)?p.substring(0,3)+'-'+p.substring(3):p;
      return'<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0"><div style="font-size:12px;font-weight:bold;color:#333">'+display+'</div><button onclick="OmegaUsarVeiculoCad('+idx+')" style="padding:4px 9px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">Usar</button></div>';
    }).join('');
  }

  function monitorarPopupsVeiculo(st,callback){
    var tent=0,intv=setInterval(function(){
      tent++;
      var bbSim=document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');
      if(bbSim&&bbSim.offsetParent!==null){
        clearInterval(intv); U.box(st,true,'Popup! Confirmando em 3s...');
        setTimeout(function(){
          bbSim.click();
          setTimeout(function(){
            var t2=0,iv2=setInterval(function(){
              t2++;
              var modal=document.getElementById('manterVeiculoModal'),titulo=modal?modal.querySelector('.modal-title'):null;
              var ehMov=titulo&&titulo.textContent.indexOf('Movimenta')!==-1;
              var vis=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
              var btnEx=document.querySelector('.btn-confirmar-exclusao');
              if(ehMov&&vis&&btnEx){
                clearInterval(iv2);
                setTimeout(function(){btnEx.click();setTimeout(function(){var btnInc=document.querySelector('.btn-confirmar-inclusao');if(btnInc)btnInc.click();setTimeout(callback,1500);},1500);},500);
              } else if(t2>=15){clearInterval(iv2);callback();}
            },300);
          },1500);
        },3000);
        return;
      }
      var chassi=document.getElementById('Chassi');
      if(chassi&&chassi.value&&chassi.value.trim()!==''){clearInterval(intv);callback();return;}
      if(tent>=20){clearInterval(intv);callback();}
    },300);
  }

  unsafeWindow.OmegaUsarVeiculoCad=function(idx){
    var st=document.getElementById('omega-veiculo-status'),lista=carregarHistorico(),item=lista[idx];
    if(!item)return U.box(st,false,'Item nao encontrado.');
    var isMovimentacao=document.querySelector('[data-tipo-pedido="MovimentacaoFrota"]')!==null;
    var modal=document.getElementById('manterVeiculoModal'),popupAberto=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
    var tituloModal=modal?modal.querySelector('.modal-title'):null,ehPopupVeiculo=tituloModal&&tituloModal.textContent.indexOf('Dados do Ve')!==-1;
    function preencher(){
      var campoPlaca=document.getElementById('Placa'),campoRenavam=document.getElementById('Renavam'),btnVerificar=document.getElementById('verificar');
      if(!campoPlaca||!campoRenavam)return U.box(st,false,'Modal do veiculo nao abriu.');
      var placaVal=(item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();
      campoPlaca.removeAttribute('disabled');campoPlaca.value='';campoPlaca.focus();campoPlaca.dispatchEvent(new Event('focus',{bubbles:true}));
      var i=0;
      function proxChar(){
        if(i>=placaVal.length){
          campoPlaca.dispatchEvent(new Event('change',{bubbles:true}));campoPlaca.dispatchEvent(new Event('blur',{bubbles:true}));
          setTimeout(function(){
            campoRenavam.removeAttribute('disabled');campoRenavam.value=item.renavam||'';
            campoRenavam.dispatchEvent(new Event('input',{bubbles:true}));campoRenavam.dispatchEvent(new Event('change',{bubbles:true}));campoRenavam.dispatchEvent(new Event('blur',{bubbles:true}));
            setTimeout(function(){
              jq.ajax({type:'GET',url:'/Veiculo/BuscarVeiculo',cache:false,data:{placa:campoPlaca.value.toUpperCase(),renavam:campoRenavam.value},
                success:function(){setTimeout(function(){if(btnVerificar)btnVerificar.click();},500);},
                error:function(){setTimeout(function(){if(btnVerificar)btnVerificar.click();},500);}
              });
              monitorarPopupsVeiculo(st,function(){
                var tara=document.getElementById('Tara');
                if(tara&&(!tara.value||tara.value==='')){tara.removeAttribute('disabled');tara.value='2';jq(tara).trigger('input').trigger('change');}
                setTimeout(function(){
                  var btnS=document.querySelector('.btn-salvar-veiculo')||document.querySelector('.btn-confirmar-inclusao');
                  if(btnS){btnS.removeAttribute('disabled');btnS.click();U.box(st,true,'Veiculo salvo! Placa: <b>'+campoPlaca.value+'</b>');}
                  else U.box(st,false,'Botao Salvar nao encontrado.');
                },800);
              });
            },400);
          },300);
          return;
        }
        var ch=placaVal[i];campoPlaca.value=placaVal.substring(0,i+1);
        campoPlaca.dispatchEvent(new Event('input',{bubbles:true}));campoPlaca.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++;setTimeout(proxChar,i===4?150:80);
      }
      proxChar();
    }
    if(isMovimentacao&&popupAberto&&ehPopupVeiculo){U.box(st,true,'Preenchendo...');preencher();}
    else{
      var btnAdd=document.querySelector('[data-action*="VeiculoPedido/Novo"]');
      if(!btnAdd)return U.box(st,false,'Botao Adicionar Veiculo nao encontrado.');
      btnAdd.click();setTimeout(preencher,1500);
    }
  };

})();
