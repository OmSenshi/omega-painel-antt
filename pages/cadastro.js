// pages/cadastro.js — modulo: Cadastro e Movimentacao de Frota (v58 — tema dark)
(function(){
  var U   = window.OmegaUtils;
  var jqR = unsafeWindow.jQuery || unsafeWindow.$;

  function abaPortalAtiva(){ var t=document.querySelector('.nav-tabs .nav-link.active'); return t?t.getAttribute('href'):''; }
  function tipoPedido(){ var el=document.querySelector('.main_content'); return el?(el.getAttribute('data-tipo-pedido')||''):''; }
  function tipoCadastro(){ var c=document.getElementById('CpfCnpjTransportador'); if(!c||!c.value)return'CPF'; return c.value.replace(/\D/g,'').length===14?'CNPJ':'CPF'; }

  // ── ABA: CADASTRO ───────────────────────────────────────────────
  U.registrarAba('cadastro', 'Cadastro', ''
    +'<div class="om-flex om-mb">'
      +'<input id="omega-cad-import-input" class="om-input om-input-sm" placeholder="Cole o codigo OMEGA Cadastro aqui" style="flex:1">'
      +'<button type="button" id="omega-cad-import-btn" class="om-btn om-btn-coral om-btn-sm" style="white-space:nowrap">Importar</button>'
    +'</div>'
    +'<div id="omega-cad-import-status"></div>'
    +'<div id="omega-cad-campos" style="display:none">'
      +'<div id="omega-cad-tipo-badge" class="om-badge"></div>'
      // Identidade
      +'<div id="omega-cad-sec-id" style="display:none">'
        +'<div class="om-section-title">Identidade / CNH</div>'
        +'<div class="om-grid om-grid-21 om-mb-sm">'
          +'<div><label class="om-label">Numero</label><input id="omega-cad-identidade" class="om-input" placeholder="000000"></div>'
          +'<div><label class="om-label">UF</label><input id="omega-cad-uf" class="om-input" placeholder="MG" maxlength="2" style="text-transform:uppercase"></div>'
        +'</div>'
      +'</div>'
      // Endereco
      +'<div id="omega-cad-sec-end" style="display:none">'
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
      +'</div>'
      // Contato
      +'<div id="omega-cad-sec-cont" style="display:none">'
        +'<div class="om-section-title">Contato</div>'
        +'<div class="om-grid om-grid-2 om-mb-sm">'
          +'<div><label class="om-label">Telefone</label><input id="omega-cad-telefone" class="om-input" placeholder="0000000000"></div>'
          +'<div><label class="om-label">Email</label><input id="omega-cad-email" class="om-input" placeholder="email@exemplo.com"></div>'
        +'</div>'
      +'</div>'
      // Socio
      +'<div id="omega-cad-sec-soc" style="display:none">'
        +'<div class="om-section-title">Gestor / Socio</div>'
        +'<div class="om-mb-sm"><label class="om-label">CPF do Socio</label><input id="omega-cad-cpf-socio" class="om-input" placeholder="00000000000"></div>'
      +'</div>'
      +'<button type="button" id="omega-cad-iniciar-btn" class="om-btn om-btn-green om-btn-full" style="margin-top:4px">&#9654; Iniciar Automacao</button>'
      +'<div id="omega-cad-iniciar-status"></div>'
    +'</div>'
    // Acoes manuais
    +'<div id="omega-cad-acoes" style="display:none">'
      +'<hr class="om-hr">'
      +'<div id="omega-cad-contatos" style="display:none">'
        +'<div class="om-section-title">Endereco</div>'
        +'<div class="om-grid om-grid-3 om-mb-sm">'
          +'<button id="omega-cep-mg" class="om-btn om-btn-blue">MG</button>'
          +'<button id="omega-cep-sp" class="om-btn om-btn-blue">SP</button>'
          +'<button id="omega-cep-rj" class="om-btn om-btn-blue">RJ</button>'
        +'</div>'
        +'<div id="omega-cep-status"></div>'
        +'<hr class="om-hr">'
        +'<div class="om-section-title">Contato</div>'
        +'<button id="omega-contato-btn" class="om-btn om-btn-blue om-btn-full">Adicionar Telefone + Email</button>'
        +'<div id="omega-contato-status"></div>'
      +'</div>'
      +'<div id="omega-cad-rt" style="display:none">'
        +'<div class="om-section-title">Responsavel Tecnico</div>'
        +'<button id="omega-rt-btn" class="om-btn om-btn-blue om-btn-full">Adicionar RT</button>'
        +'<div id="omega-rt-status"></div>'
      +'</div>'
      +'<div id="omega-cad-veiculo" style="display:none">'
        +'<div class="om-section-title">Veiculo</div>'
        +'<div id="omega-veiculo-hist" class="om-hist-scroll om-mb-sm"></div>'
        +'<div id="omega-veiculo-vazio" class="om-vazio">Nenhum veiculo no historico</div>'
        +'<div id="omega-veiculo-status"></div>'
      +'</div>'
    +'</div>'
  , function(){ atualizarSecaoAcoes(); });

  // ── Listeners abas do portal ────────────────────────────────────
  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab', atualizarSecaoAcoes);
    link.addEventListener('click', function(){ ST(atualizarSecaoAcoes, 300); });
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
    var algum = (aba==='#contatos'||aba==='#responsavelTecnico'||aba==='#veiculo');
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
    var dados = U.parseCodigo(codigo);
    var tipo = (dados.tipo||'').toUpperCase();
    if(tipo!=='CPF'&&tipo!=='CNPJ') return U.box(st,false,'Codigo invalido.');
    document.getElementById('omega-cad-tipo-badge').textContent = tipo==='CPF' ? 'Cadastro CPF' : 'Cadastro CNPJ';
    document.getElementById('omega-cad-sec-id').style.display   = tipo==='CPF' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-cont').style.display = tipo==='CNPJ' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-soc').style.display  = tipo==='CNPJ' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-end').style.display  = 'block';
    function set(id,val){ var el=document.getElementById(id); if(el) el.value=val||''; }
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
    var st = document.getElementById('omega-cad-iniciar-status');
    if(!U.guardClique(this, 60000)) return false;
    var tipo = document.getElementById('omega-cad-tipo-badge').textContent.indexOf('CNPJ')!==-1 ? 'CNPJ' : 'CPF';
    U.box(st,true,'Iniciando...'); window._omegaAutomacaoAtiva = true; U.matarTimers();
    if(tipo==='CPF') iniciarCPF(st); else iniciarCNPJ(st);
    return false;
  }, true);

  // ═══════════════ AUTOMACAO CPF ═══════════════
  function iniciarCPF(st) {
    var identidade=document.getElementById('omega-cad-identidade').value.trim()||'000000';
    var uf=document.getElementById('omega-cad-uf').value.trim().toUpperCase();
    var cep=document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro=document.getElementById('omega-cad-logradouro').value.trim();
    var numero=document.getElementById('omega-cad-numero').value.trim()||'0';
    var bairro=document.getElementById('omega-cad-bairro').value.trim()||'0';
    var complemento=document.getElementById('omega-cad-complemento').value.trim();
    U.box(st,true,'1/2 — Transportador...');
    preencherTransportadorCPF(identidade, uf, function(){
      ST(function(){ U.matarTimers(); U.box(st,true,'2/2 — Endereco...');
        preencherEndereco(cep,logradouro,numero,bairro,complemento,st,function(){
          window._omegaAutomacaoAtiva=false; U.box(st,true,'Automacao CPF concluida!');
        });
      },1200);
    });
  }

  // ═══════════════ AUTOMACAO CNPJ ═══════════════
  function iniciarCNPJ(st) {
    var cep=document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro=document.getElementById('omega-cad-logradouro').value.trim();
    var numero=document.getElementById('omega-cad-numero').value.trim()||'0';
    var bairro=document.getElementById('omega-cad-bairro').value.trim()||'0';
    var complemento=document.getElementById('omega-cad-complemento').value.trim();
    var telefone=document.getElementById('omega-cad-telefone').value.replace(/\D/g,'')||'0000000000';
    var email=document.getElementById('omega-cad-email').value.trim()||U.gerarEmail();
    var cpfSocio=document.getElementById('omega-cad-cpf-socio').value.replace(/\D/g,'');
    U.box(st,true,'1/6 — Capacidade financeira...');
    var cbCap=document.getElementById('TransportadorEtc_SituacaoCapacidadeFinanceira');
    if(cbCap) U.marcarICheck(cbCap);
    ST(function(){ U.matarTimers(); U.box(st,true,'2/6 — Endereco...');
      preencherEndereco(cep,logradouro,numero,bairro,complemento,st,function(){
        ST(function(){ U.matarTimers(); U.box(st,true,'3/6 — Telefone...');
          adicionarContato('2',telefone,function(){
            ST(function(){ U.matarTimers(); U.box(st,true,'4/6 — Email...');
              adicionarContato('4',email,function(){
                ST(function(){ U.matarTimers(); U.box(st,true,'5/6 — Gestor...');
                  if(cpfSocio){
                    adicionarGestor(cpfSocio,st,function(){
                      ST(function(){ U.matarTimers(); U.box(st,true,'6/6 — RT...');
                        adicionarRT(st,function(){ window._omegaAutomacaoAtiva=false; U.box(st,true,'Automacao CNPJ concluida!'); });
                      },1500);
                    });
                  } else {
                    U.box(st,true,'6/6 — RT (sem gestor)...');
                    adicionarRT(st,function(){ window._omegaAutomacaoAtiva=false; U.box(st,false,'RT ok. Gestor sem CPF — adicione manualmente.'); });
                  }
                },2000);
              });
            },2000);
          });
        },1500);
      });
    },1200);
  }

  // ═══════════════ FUNCOES ═══════════════
  function preencherTransportadorCPF(identidade, uf, callback) {
    var ci=document.getElementById('TransportadorTac_Identidade')||document.querySelector('input[name="TransportadorTac.Identidade"]')||document.getElementById('Identidade');
    var co=document.getElementById('TransportadorTac_OrgaoEmissor')||document.querySelector('input[name="TransportadorTac.OrgaoEmissor"]')||document.getElementById('OrgaoEmissor');
    var cu=document.getElementById('TransportadorTac_Uf')||document.querySelector('select[name="TransportadorTac.Uf"]')||document.getElementById('UF');
    if(ci){ci.removeAttribute('disabled');ci.removeAttribute('readonly');ci.value=identidade;jqR(ci).trigger('input').trigger('change').trigger('blur');}
    if(co){co.removeAttribute('disabled');co.removeAttribute('readonly');co.value='SSP';jqR(co).trigger('input').trigger('change').trigger('blur');}
    if(cu&&uf){for(var i=0;i<cu.options.length;i++){if(cu.options[i].value===uf||cu.options[i].text===uf){cu.selectedIndex=i;jqR(cu).trigger('change');break;}}}
    callback();
  }

  function preencherEndereco(cep,logradouro,numero,bairro,complemento,st,callback) {
    var btn=document.querySelector('button[data-action*="EnderecoPedido/Novo"]');
    if(!btn){U.box(st,false,'Botao Endereco nao encontrado.');callback();return;}
    if(!U.guardClique(btn,10000)){callback();return;}
    btn.click();
    var cepFinal=(cep?cep:U.cepAleatorio('MG')).replace(/\D/g,'');
    var temDados=!!(cep&&logradouro&&logradouro!=='0');
    U.poll(function(){var c=document.getElementById('Cep'),ct=document.getElementById('CodigoTipoEndereco');return(c&&ct&&ct.options.length>1)?{c:c,ct:ct}:null;},
      function(r){r.ct.value='COR';r.ct.selectedIndex=Array.from(r.ct.options).findIndex(function(o){return o.value==='COR';});jqR(r.ct).trigger('change');
        U.poll(function(){var ct=document.getElementById('CodigoTipoEndereco');return ct&&ct.value==='COR';},
          function(){digitarCEPEndereco(document.getElementById('Cep'),cepFinal,temDados,logradouro,numero,bairro,complemento,st,callback);},
          {maxTentativas:10,intervalo:200,onTimeout:function(){digitarCEPEndereco(document.getElementById('Cep'),cepFinal,temDados,logradouro,numero,bairro,complemento,st,callback);}});
      },{maxTentativas:40,intervalo:200,onTimeout:function(){U.box(st,false,'Modal de endereco nao abriu.');callback();}});
  }

  function digitarCEPEndereco(campoCep,cepFinal,temDados,logradouro,numero,bairro,complemento,st,callback) {
    if(!campoCep){U.box(st,false,'Campo CEP nao encontrado.');callback();return;}
    U.digitarCharAChar(campoCep,cepFinal,{delay:100,onDone:function(){
      campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));
      campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
      var l=document.getElementById('Logradouro');if(l){l.focus();ST(function(){l.blur();},100);}
      U.poll(function(){var l2=document.getElementById('Logradouro');return l2&&l2.value&&l2.value.trim()!=='';},
        function(){finalizarEndereco(temDados,logradouro,numero,bairro,complemento,st,callback);},
        {maxTentativas:20,intervalo:500,onTimeout:function(){finalizarEndereco(temDados,logradouro,numero,bairro,complemento,st,callback);}});
    }});
  }

  function finalizarEndereco(temDados,logradouro,numero,bairro,complemento,st,callback) {
    ST(function(){
      var l3=document.getElementById('Logradouro'),n3=document.getElementById('Numero'),b3=document.getElementById('Bairro'),c3=document.getElementById('Complemento');
      if(l3){l3.value=temDados?logradouro:'0';jqR(l3).trigger('input').trigger('change');}
      if(n3){n3.value=temDados?(numero||'0'):'0';jqR(n3).trigger('input').trigger('change');}
      if(b3){b3.value=temDados?(bairro||'0'):'0';jqR(b3).trigger('input').trigger('change');}
      if(c3&&complemento&&temDados){c3.value=complemento;jqR(c3).trigger('input').trigger('change');}
      ST(function(){
        var cb=document.getElementById('MesmoEndereco');if(cb&&!cb.checked)U.marcarICheck(cb);
        ST(function(){var btnS=document.querySelector('.btn-salvar-endereco');if(btnS&&U.guardClique(btnS,5000))btnS.click();U.matarTimers();ST(callback,2000);},600);
      },500);
    },400);
  }

  function adicionarContato(tipoVal,contatoVal,callback){
    var btn=document.querySelector('button[data-action*="ContatoPedido/Novo"]');
    if(!btn){callback(false);return;}btn._omegaClicado=false;
    if(!U.guardClique(btn,8000)){callback(false);return;}btn.click();
    ST(function(){
      var t=document.getElementById('CodigoTipoContato');if(!t){callback(false);return;}
      t.value=tipoVal;jqR(t).trigger('change');
      U.poll(function(){var tA=document.getElementById('CodigoTipoContato');return tA&&tA.value===tipoVal;},function(){
        ST(function(){
          var c=document.getElementById('Contato');if(!c){callback(false);return;}
          U.digitarCharAChar(c,contatoVal,{delay:60,onDone:function(){
            ST(function(){
              c=document.getElementById('Contato');
              if(!c||!c.value||c.value.trim()===''){U.fecharModal();callback(false);return;}
              var s=document.querySelector('.btn-salvar-contato');
              if(s&&U.guardClique(s,5000)){s.click();
                ST(function(){var ma=document.querySelector('.modal.show #manterContatoForm');if(ma){U.fecharModal();callback(false);}else{U.matarTimers();ST(function(){callback(true);},1500);}},1500);
              }else if(!s)callback(false);
            },600);
          }});
        },400);
      },{maxTentativas:20,intervalo:300,onTimeout:function(){callback(false);}});
    },1200);
  }

  function adicionarGestor(cpfSocio,st,callback){
    var cpfFmt=cpfSocio.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
    var btn=document.querySelector('button[data-action*="GestorPedido/Novo"]');
    if(!btn){document.querySelectorAll('button').forEach(function(el){if(!btn&&el.textContent.trim()==='Adicionar Gestor')btn=el;});}
    if(!btn){U.box(st,false,'Botao Gestor nao encontrado — adicione manualmente.');callback();return;}
    if(!U.guardClique(btn,10000)){callback();return;}btn.click();
    U.poll(function(){return document.getElementById('CpfCnpj');},function(campoCPF){
      var cf=document.getElementById('CodigoTipoVinculo');if(cf)cf.value='1';
      U.poll(function(){var c=document.getElementById('CpfCnpj');return c&&!c.disabled&&!c.readOnly?c:null;},function(c){
        var cf2=document.getElementById('CodigoTipoVinculo');if(cf2&&cf2.value!=='1')cf2.value='1';
        U.digitarCharAChar(c,cpfFmt,{delay:80,onDone:function(){
          U.poll(function(){var n=document.getElementById('Nome');return n&&n.value&&n.value.trim()!=='';},function(){
            U.matarTimers();U.marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
            ST(function(){var btnS=document.querySelector('.btn-salvar-gestor');if(btnS&&U.guardClique(btnS,5000)){btnS.removeAttribute('disabled');btnS.click();}U.matarTimers();ST(callback,2500);},800);
          },{maxTentativas:30,intervalo:600,onTimeout:function(){U.box(st,false,'Portal nao carregou nome do gestor.');callback();}});
        }});
      },{maxTentativas:15,intervalo:200,onTimeout:function(){var c2=document.getElementById('CpfCnpj');if(c2){U.digitarCharAChar(c2,cpfFmt,{delay:80,onDone:function(){callback();}});}else{U.box(st,false,'Campo CPF nao encontrado.');callback();}}});
    },{maxTentativas:30,intervalo:200,onTimeout:function(){U.box(st,false,'Modal Gestor nao abriu.');callback();}});
  }

  var CPF_RT='071.417.536-64';
  function adicionarRT(st,callback){
    var btn=document.querySelector('button[data-action*="ResponsavelTecnico/Criar"]');
    if(!btn){document.querySelectorAll('button').forEach(function(el){if(!btn&&el.textContent.trim()==='Adicionar Responsável Técnico')btn=el;});}
    if(!btn){callback();return;}if(!U.guardClique(btn,10000)){callback();return;}btn.click();
    U.poll(function(){return document.getElementById('Cpf');},function(cpf){
      cpf.value=CPF_RT;jqR(cpf).trigger('input').trigger('change').trigger('blur');
      U.poll(function(){var n=document.getElementById('Nome');return n&&n.value&&n.value.trim()!=='';},function(){
        U.marcarICheck(document.getElementById('FoiResponsavelTecnico'));U.marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
        ST(function(){var btnS=document.getElementById('btnSalvar');if(btnS&&U.guardClique(btnS,5000)){btnS.removeAttribute('disabled');btnS.click();}U.matarTimers();ST(callback,2000);},800);
      },{maxTentativas:20,intervalo:600,onTimeout:function(){callback();}});
    },{maxTentativas:30,intervalo:200,onTimeout:function(){callback();}});
  }

  // ── CEP manual ──────────────────────────────────────────────────
  function preencherEnderecoManual(estado){
    var st=document.getElementById('omega-cep-status'),cep=U.cepAleatorio(estado);
    var btn=document.querySelector('button[data-action*="EnderecoPedido/Novo"]');
    if(!btn)return U.box(st,false,'Botao Endereco nao encontrado.');
    if(!U.guardClique(btn,10000))return;
    U.box(st,true,'Abrindo formulario...');btn.click();var cepN=cep.replace(/\D/g,'');
    U.poll(function(){var c=document.getElementById('Cep'),ct=document.getElementById('CodigoTipoEndereco');return(c&&ct&&ct.options.length>1)?{c:c,ct:ct}:null;},function(r){
      r.ct.value='COR';r.ct.selectedIndex=Array.from(r.ct.options).findIndex(function(o){return o.value==='COR';});jqR(r.ct).trigger('change');
      U.poll(function(){var ct=document.getElementById('CodigoTipoEndereco');return ct&&ct.value==='COR';},function(){
        U.digitarCharAChar(document.getElementById('Cep'),cepN,{delay:80,onDone:function(){
          var cc=document.getElementById('Cep');
          cc.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));cc.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          var l=document.getElementById('Logradouro');if(l){l.focus();ST(function(){l.blur();},100);}
          U.box(st,true,'CEP '+cep+' inserido...');
          U.poll(function(){var l2=document.getElementById('Logradouro');return l2&&l2.value&&l2.value.trim()!=='';},function(){finalizarEnderecoManual(estado,cep,st);},{maxTentativas:20,intervalo:500,onTimeout:function(){finalizarEnderecoManual(estado,cep,st);}});
        }});
      },{maxTentativas:10,intervalo:200,onTimeout:function(){U.digitarCharAChar(document.getElementById('Cep'),cepN,{delay:80,onDone:function(){finalizarEnderecoManual(estado,cep,st);}});}});
    },{maxTentativas:40,intervalo:200,onTimeout:function(){U.box(st,false,'Modal nao abriu.');}});
  }
  function finalizarEnderecoManual(estado,cep,st){
    ST(function(){
      var l3=document.getElementById('Logradouro'),n3=document.getElementById('Numero'),b3=document.getElementById('Bairro');
      if(l3){l3.value='0';jqR(l3).trigger('input').trigger('change');}if(n3){n3.value='0';jqR(n3).trigger('input').trigger('change');}if(b3){b3.value='0';jqR(b3).trigger('input').trigger('change');}
      ST(function(){var cb=document.getElementById('MesmoEndereco');if(cb&&!cb.checked)U.marcarICheck(cb);
        ST(function(){var btnS=document.querySelector('.btn-salvar-endereco');if(btnS&&U.guardClique(btnS,5000)){btnS.click();U.box(st,true,'Endereco ('+estado+'/'+cep+') salvo!');}},600);
      },500);
    },300);
  }

  document.getElementById('omega-cep-mg').addEventListener('click',function(){preencherEnderecoManual('MG');});
  document.getElementById('omega-cep-sp').addEventListener('click',function(){preencherEnderecoManual('SP');});
  document.getElementById('omega-cep-rj').addEventListener('click',function(){preencherEnderecoManual('RJ');});

  document.getElementById('omega-contato-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-contato-status');
    if(tipoCadastro()==='CPF'){U.box(st,true,'CPF — contatos ja preenchidos pelo portal.');return;}
    U.box(st,true,'Adicionando telefone...');
    adicionarContato('2','0000000000',function(ok){
      if(!ok){U.box(st,false,'Erro no telefone.');return;}
      ST(function(){var email=U.gerarEmail();adicionarContato('4',email,function(ok2){
        if(ok2)U.box(st,true,'Tel + email adicionados!<br><span style="font-size:10px">'+email+'</span>');
        else U.box(st,false,'Telefone ok, erro no email.');
      });},2000);
    });
  });

  document.getElementById('omega-rt-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-rt-status');
    adicionarRT(st,function(){U.box(st,true,'RT adicionado! CPF: '+CPF_RT);});
  });

  // ── Historico veiculos ──────────────────────────────────────────
  function renderHistoricoVeiculo(){
    var lista=U.carregarHistorico(),el=document.getElementById('omega-veiculo-hist'),vazio=document.getElementById('omega-veiculo-vazio');
    if(!el)return;
    if(lista.length===0){el.innerHTML='';if(vazio)vazio.style.display='block';return;}
    if(vazio)vazio.style.display='none';
    el.innerHTML=lista.map(function(item,idx){
      return '<div class="om-hist-item"><div class="om-hist-placa">'+U.formatarPlaca(item.placa||'')+'</div>'
        +'<button onclick="OmegaUsarVeiculoCad('+idx+')" class="om-btn om-btn-blue om-btn-sm">Usar</button></div>';
    }).join('');
  }

  function monitorarPopupsVeiculo(st,callback){
    U.poll(function(){
      var bb=document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');
      if(bb&&bb.offsetParent!==null)return{tipo:'bootbox',btn:bb};
      var ch=document.getElementById('Chassi');if(ch&&ch.value&&ch.value.trim()!=='')return{tipo:'chassi'};return null;
    },function(r){
      if(r.tipo==='chassi'){callback();return;}
      U.box(st,true,'Popup! Confirmando em 3s...');
      ST(function(){r.btn.click();ST(function(){
        U.poll(function(){var m=document.getElementById('manterVeiculoModal'),t=m?m.querySelector('.modal-title'):null;var e=t&&t.textContent.indexOf('Movimenta')!==-1;var v=m&&(m.style.display==='block'||m.classList.contains('show'));var b=document.querySelector('.btn-confirmar-exclusao');return(e&&v&&b)?b:null;},
          function(bx){ST(function(){bx.click();ST(function(){var bi=document.querySelector('.btn-confirmar-inclusao');if(bi)bi.click();ST(callback,1500);},1500);},500);},
          {maxTentativas:15,intervalo:300,onTimeout:callback});
      },1500);},3000);
    },{maxTentativas:20,intervalo:300,onTimeout:callback});
  }

  unsafeWindow.OmegaUsarVeiculoCad=function(idx){
    var st=document.getElementById('omega-veiculo-status'),lista=U.carregarHistorico(),item=lista[idx];
    if(!item)return U.box(st,false,'Item nao encontrado.');
    if(unsafeWindow._omegaVeiculoEmAndamento){U.box(st,false,'Aguarde — ja ha um veiculo em andamento.');return;}
    unsafeWindow._omegaVeiculoEmAndamento=true;var lib=function(){unsafeWindow._omegaVeiculoEmAndamento=false;};
    var isMov=document.querySelector('[data-tipo-pedido="MovimentacaoFrota"]')!==null;
    var modal=document.getElementById('manterVeiculoModal'),aberto=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
    var tt=modal?modal.querySelector('.modal-title'):null,ehV=tt&&tt.textContent.indexOf('Dados do Ve')!==-1;
    function preencher(){
      U.poll(function(){var m=document.getElementById('manterVeiculoModal');var v=m&&(m.style.display==='block'||m.classList.contains('show'));var p=document.getElementById('Placa'),r=document.getElementById('Renavam');return(v&&p&&r)?{placa:p,renavam:r}:null;},
        function(c){U.box(st,true,'Modal aberto. Preenchendo...');preencherCamposV(c.placa,c.renavam,item,st,lib);},
        {maxTentativas:40,intervalo:200,onTimeout:function(){lib();U.box(st,false,'Modal do veiculo nao abriu.');}});
    }
    function preencherCamposV(cp,cr,item,st,lib){
      var jq=window.OmegaJQ,bv=document.getElementById('verificar'),pv=(item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();
      cp.removeAttribute('disabled');
      U.digitarCharAChar(cp,pv,{delay:80,delayEspecial:{4:150},onDone:function(){
        ST(function(){cr.removeAttribute('disabled');cr.value=item.renavam||'';cr.dispatchEvent(new Event('input',{bubbles:true}));cr.dispatchEvent(new Event('change',{bubbles:true}));cr.dispatchEvent(new Event('blur',{bubbles:true}));
          ST(function(){
            if(bv&&U.guardClique(bv,3000)){jq.ajax({type:'GET',url:'/Veiculo/BuscarVeiculo',cache:false,data:{placa:cp.value.toUpperCase(),renavam:cr.value},success:function(){ST(function(){bv.click();},500);},error:function(){ST(function(){bv.click();},500);}});}
            monitorarPopupsVeiculo(st,function(){
              var tara=document.getElementById('Tara');if(tara&&(!tara.value||tara.value==='')){tara.removeAttribute('disabled');tara.value='2';jq(tara).trigger('input').trigger('change');}
              ST(function(){var bs=document.querySelector('.btn-salvar-veiculo')||document.querySelector('.btn-confirmar-inclusao');if(bs&&U.guardClique(bs,5000)){bs.removeAttribute('disabled');bs.click();U.box(st,true,'Veiculo salvo! Placa: <b>'+cp.value+'</b>');}else if(!bs)U.box(st,false,'Botao Salvar nao encontrado.');lib();},800);
            });
          },400);
        },300);
      }});
    }
    if(isMov&&aberto&&ehV){U.box(st,true,'Preenchendo...');preencher();}
    else{var ba=document.querySelector('[data-action*="VeiculoPedido/Novo"]');if(!ba){lib();return U.box(st,false,'Botao Adicionar Veiculo nao encontrado.');}if(!U.guardClique(ba,10000)){lib();return;}ba.click();preencher();}
  };
})();
