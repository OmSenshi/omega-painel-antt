// pages/cadastro.js — modulo: Cadastro e Movimentacao de Frota
(function(){
  var U  = window.OmegaUtils;
  var jq = window.OmegaJQ;

  var CEPS = {
    MG: ['30110-010','30130-010','30140-070','30150-320','32310-060'],
    SP: ['01001-000','01310-100','01320-000','01410-001','01530-001'],
    RJ: ['20040-020','20050-090','20090-003','20211-110','20231-092']
  };

  function cepAleatorio(estado) {
    var lista = CEPS[estado];
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function abaAtiva() {
    var tab = document.querySelector('.nav-tabs .nav-link.active');
    return tab ? tab.getAttribute('href') : '';
  }

  function tipoPedido() {
    var el = document.querySelector('.main_content');
    return el ? (el.getAttribute('data-tipo-pedido') || '') : '';
  }
  // Salva o tipo de pedido no DOM para ficar acessivel em qualquer contexto
  document.body.setAttribute('data-omega-tipo-pedido', tipoPedido());

  function tipoCadastro() {
    var cnpj = document.getElementById('CpfCnpjTransportador');
    if(!cnpj || !cnpj.value) return 'CPF';
    return cnpj.value.replace(/\D/g,'').length === 14 ? 'CNPJ' : 'CPF';
  }

  // ── HTML do painel ──────────────────────────────────────────────
  U.addSecao(''
    +'<div id="omega-cad-contatos">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Endereco</div>'
      +'<div style="font-size:11px;color:#555;margin-bottom:6px">Selecione o estado:</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">'
        +'<button id="omega-cep-mg" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">MG</button>'
        +'<button id="omega-cep-sp" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">SP</button>'
        +'<button id="omega-cep-rj" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">RJ</button>'
      +'</div>'
      +'<div id="omega-cep-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:10px"></div>'
      +'<hr style="margin:10px 0;border:none;border-top:1px solid #eee">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Contato</div>'
      +'<button id="omega-contato-btn" style="width:100%;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar Telefone + Email</button>'
      +'<div id="omega-contato-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
    +'</div>'

    +'<div id="omega-cad-rt" style="display:none">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Responsavel Tecnico</div>'
      +'<button id="omega-rt-btn" style="width:100%;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar RT</button>'
      +'<div id="omega-rt-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
    +'</div>'

    +'<div id="omega-cad-veiculo" style="display:none">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Veiculo</div>'
      +'<div id="omega-veiculo-hist" style="max-height:200px;overflow-y:auto;margin-bottom:8px"></div>'
      +'<div id="omega-veiculo-vazio" style="font-size:11px;color:#aaa;text-align:center;padding:10px 0">Nenhum veiculo no historico</div>'
      +'<div id="omega-veiculo-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
    +'</div>'
  );

  // ── Detecta aba e mostra secao correta ──────────────────────────
  function atualizarSecao() {
    var aba = abaAtiva();
    var isMovimentacao = tipoPedido() === 'MovimentacaoFrota';
    document.body.setAttribute('data-omega-tipo-pedido', tipoPedido());

    if(isMovimentacao){
      document.getElementById('omega-cad-contatos').style.display  = 'none';
      document.getElementById('omega-cad-rt').style.display        = 'none';
      document.getElementById('omega-cad-veiculo').style.display   = 'block';
      renderHistoricoVeiculo();
      return;
    }

    document.getElementById('omega-cad-contatos').style.display  = (aba==='#contatos')          ? 'block' : 'none';
    document.getElementById('omega-cad-rt').style.display        = (aba==='#responsavelTecnico') ? 'block' : 'none';
    document.getElementById('omega-cad-veiculo').style.display   = (aba==='#veiculo')            ? 'block' : 'none';
    if(aba==='#veiculo') renderHistoricoVeiculo();
  }

  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab', atualizarSecao);
    link.addEventListener('click', function(){ setTimeout(atualizarSecao, 300); });
  });
  atualizarSecao();

  // ── CEP / Endereco ──────────────────────────────────────────────
  function preencherEndereco(estado) {
    var st  = document.getElementById('omega-cep-status');
    var cep = cepAleatorio(estado);
    var btn = document.querySelector('[data-action*="EnderecoPedido/Novo"]');
    if(!btn) return U.box(st, false, 'Botao "Adicionar Endereco" nao encontrado.');
    U.box(st, true, 'Abrindo formulario...');
    btn.click();
    setTimeout(function(){
      var campoCep  = document.getElementById('Cep');
      var campoTipo = document.getElementById('CodigoTipoEndereco');
      if(!campoCep) return U.box(st, false, 'Modal nao abriu. Tente novamente.');
      if(campoTipo){ campoTipo.value = 'COR'; jq(campoTipo).trigger('change'); }
      campoCep.value = cep;
      jq(campoCep).trigger('change').trigger('blur');
      U.box(st, true, 'CEP '+cep+' ('+estado+') inserido. Aguardando portal...');
      setTimeout(function(){
        var l = document.getElementById('Logradouro');
        var n = document.getElementById('Numero');
        var b = document.getElementById('Bairro');
        if(l){ l.value='0'; jq(l).trigger('input').trigger('change'); }
        if(n){ n.value='0'; jq(n).trigger('input').trigger('change'); }
        if(b){ b.value='0'; jq(b).trigger('input').trigger('change'); }
        setTimeout(function(){
          document.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
            var txt = (cb.closest('label')||cb.parentElement||{}).textContent||'';
            if(txt.toLowerCase().includes('mesmo')||txt.toLowerCase().includes('comercial')){
              if(!cb.checked){ cb.checked=true; jq(cb).trigger('change').trigger('click'); }
            }
          });
          setTimeout(function(){
            var btnS = document.querySelector('.btn-salvar-endereco');
            if(btnS){ btnS.click(); U.box(st, true, 'Endereco ('+estado+' / '+cep+') salvo!'); }
            else U.box(st, false, 'Botao Salvar nao encontrado.');
          }, 500);
        }, 800);
      }, 2000);
    }, 1000);
  }

  document.getElementById('omega-cep-mg').addEventListener('click', function(){ preencherEndereco('MG'); });
  document.getElementById('omega-cep-sp').addEventListener('click', function(){ preencherEndereco('SP'); });
  document.getElementById('omega-cep-rj').addEventListener('click', function(){ preencherEndereco('RJ'); });

  // ── Contato ─────────────────────────────────────────────────────
  document.getElementById('omega-contato-btn').addEventListener('click', function(){
    var st   = document.getElementById('omega-contato-status');
    var tipo = tipoCadastro();
    if(tipo === 'CPF'){
      U.box(st, true, 'CPF detectado — contatos ja vem preenchidos pelo portal.');
      return;
    }
    U.box(st, true, 'Adicionando telefone...');
    adicionarContato('2', '0000000000', function(okTel){
      if(!okTel){ U.box(st, false, 'Erro ao adicionar telefone.'); return; }
      setTimeout(function(){
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var email = '';
        for(var i=0;i<12;i++) email += chars[Math.floor(Math.random()*chars.length)];
        email += '@yahoo.com';
        adicionarContato('4', email, function(okEmail){
          if(okEmail) U.box(st, true, 'Tel e email adicionados!<br><span style="font-size:10px;color:#555">'+email+'</span>');
          else U.box(st, false, 'Telefone ok, erro no email.');
        });
      }, 1500);
    });
  });

  function adicionarContato(tipoVal, contatoVal, callback){
    var btn = document.querySelector('[data-action*="ContatoPedido/Novo"]');
    if(!btn){ callback(false); return; }
    btn.click();
    setTimeout(function(){
      var t = document.getElementById('CodigoTipoContato');
      var c = document.getElementById('Contato');
      if(!t||!c){ callback(false); return; }
      t.value = tipoVal; jq(t).trigger('change');
      setTimeout(function(){
        c.value = contatoVal; jq(c).trigger('input').trigger('change');
        setTimeout(function(){
          var s = document.querySelector('.btn-salvar-contato');
          if(s){ s.click(); callback(true); } else callback(false);
        }, 400);
      }, 300);
    }, 800);
  }

  // ── Responsavel Tecnico ─────────────────────────────────────────
  var CPF_RT = '071.417.536-64';

  document.getElementById('omega-rt-btn').addEventListener('click', function(){
    var st  = document.getElementById('omega-rt-status');
    var btn = document.querySelector('[data-action*="ResponsavelTecnico/Criar"]');
    if(!btn) return U.box(st, false, 'Botao "Adicionar RT" nao encontrado.');
    U.box(st, true, 'Abrindo formulario do RT...');
    btn.click();
    setTimeout(function(){
      var cpf = document.getElementById('Cpf');
      if(!cpf) return U.box(st, false, 'Modal do RT nao abriu.');
      cpf.value = CPF_RT;
      jq(cpf).trigger('input').trigger('change').trigger('blur');
      U.box(st, true, 'CPF inserido. Aguardando portal carregar...');
      var tent = 0;
      var intv = setInterval(function(){
        tent++;
        var nome = document.getElementById('Nome');
        var btnS = document.getElementById('btnSalvar');
        if((nome && nome.value && nome.value.trim()!=='') || tent > 15){
          clearInterval(intv);
          if(!nome || !nome.value){ U.box(st, false, 'Portal demorou. Marque as caixas e salve manualmente.'); return; }
          function marcarICheck(cb){ if(!cb) return; jq(cb).iCheck('check'); cb.checked=true; jq(cb).trigger('ifChecked').trigger('change'); }
          marcarICheck(document.getElementById('FoiResponsavelTecnico'));
          marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
          setTimeout(function(){
            if(btnS){ btnS.removeAttribute('disabled'); btnS.click(); U.box(st, true, 'RT adicionado! CPF: '+CPF_RT); }
            else U.box(st, false, 'Botao Salvar nao encontrado.');
          }, 600);
        }
      }, 500);
    }, 1000);
  });

  // ── Historico de veiculos ───────────────────────────────────────
  var HIST_KEY = 'omega_historico';

  function carregarHistorico(){
    try{
      var raw = (typeof GM_getValue!=='undefined') ? GM_getValue(HIST_KEY,'[]') : localStorage.getItem(HIST_KEY)||'[]';
      var lista = JSON.parse(raw);
      return lista.filter(function(i){ return (Date.now()-i.ts) < 24*60*60*1000; });
    } catch(e){ return []; }
  }

  function renderHistoricoVeiculo(){
    var lista = carregarHistorico();
    var el    = document.getElementById('omega-veiculo-hist');
    var vazio = document.getElementById('omega-veiculo-vazio');
    if(!el) return;
    if(lista.length===0){ el.innerHTML=''; if(vazio) vazio.style.display='block'; return; }
    if(vazio) vazio.style.display='none';
    el.innerHTML = lista.map(function(item,idx){
      var p = item.placa||'';
      var display = /^[A-Z]{3}[0-9]{4}$/.test(p) ? p.substring(0,3)+'-'+p.substring(3) : p;
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0">'
        +'<div style="font-size:12px;font-weight:bold;color:#333">'+display+'</div>'
        +'<button onclick="OmegaUsarVeiculoCad('+idx+')" style="padding:5px 10px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">Usar</button>'
      +'</div>';
    }).join('');
  }

  // ── Monitor de popups apos verificar ───────────────────────────
  function monitorarPopupsVeiculo(st, callback){
    var tentativas = 0;
    var intv = setInterval(function(){
      tentativas++;

      // Popup 1: bootbox (Nao/Sim)
      var bootboxSim = document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');
      if(bootboxSim && bootboxSim.offsetParent !== null){
        clearInterval(intv);
        U.box(st, true, 'Popup detectado! Confirmando em 3s...');
        setTimeout(function(){
          bootboxSim.click();
          U.box(st, true, 'Confirmado! Aguardando popup de exclusao...');
          // Popup 2: Pedido de Movimentacao de Frota
          setTimeout(function(){
            var tent2 = 0;
            var intv2 = setInterval(function(){
              tent2++;
              var modal = document.getElementById('manterVeiculoModal');
              var titulo = modal ? modal.querySelector('.modal-title') : null;
              var ehMovimentacao = titulo && titulo.textContent.indexOf('Movimenta')!==-1;
              var visivel = modal && (modal.style.display==='block' || modal.classList.contains('show'));
              var btnExclusao = document.querySelector('.btn-confirmar-exclusao');
              if(ehMovimentacao && visivel && btnExclusao){
                clearInterval(intv2);
                U.box(st, true, 'Confirmando exclusao...');
                setTimeout(function(){
                  btnExclusao.click();
                  setTimeout(function(){
                    var btnInclusao = document.querySelector('.btn-confirmar-inclusao');
                    if(btnInclusao){ btnInclusao.click(); U.box(st, true, 'Incluido na frota!'); }
                    setTimeout(function(){ callback(); }, 1500);
                  }, 1500);
                }, 500);
              } else if(tent2>=15){ clearInterval(intv2); callback(); }
            }, 300);
          }, 1500);
        }, 3000);
        return;
      }

      // Sem popup — verifica se Chassi foi preenchido
      var chassi = document.getElementById('Chassi');
      if(chassi && chassi.value && chassi.value.trim()!==''){
        clearInterval(intv);
        callback();
        return;
      }

      if(tentativas>=20){ clearInterval(intv); callback(); }
    }, 300);
  }

  // ── Usar veiculo do historico ───────────────────────────────────
  unsafeWindow.OmegaUsarVeiculoCad = function(idx){
    var st    = document.getElementById('omega-veiculo-status');
    var lista = carregarHistorico();
    var item  = lista[idx];
    if(!item) return U.box(st, false, 'Item nao encontrado.');

    var isMovimentacao = document.body.getAttribute('data-omega-tipo-pedido') === 'MovimentacaoFrota';

    // Verifica se popup de veiculo ja esta aberto
    var modal = document.getElementById('manterVeiculoModal');
    var popupAberto = modal && (modal.style.display==='block' || modal.classList.contains('show'));
    // Em movimentacao o titulo do modal aberto e "Dados do Veiculo"
    var tituloModal = modal ? modal.querySelector('.modal-title') : null;
    var ehPopupVeiculo = tituloModal && tituloModal.textContent.indexOf('Dados do Ve')!==-1;

    function preencher(){
      var campoPlaca   = document.getElementById('Placa');
      var campoRenavam = document.getElementById('Renavam');
      var btnVerificar = document.getElementById('verificar');

      if(!campoPlaca || !campoRenavam) return U.box(st, false, 'Modal do veiculo nao abriu.');

      var placaVal = (item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();

      U.box(st, true, 'Preenchendo placa...');
      campoPlaca.removeAttribute('disabled');
      campoPlaca.value = '';
      campoPlaca.focus();
      campoPlaca.dispatchEvent(new Event('focus',{bubbles:true}));

      var i=0;
      function proxChar(){
        if(i>=placaVal.length){
          campoPlaca.dispatchEvent(new Event('change',{bubbles:true}));
          campoPlaca.dispatchEvent(new Event('blur',{bubbles:true}));
          setTimeout(function(){
            campoRenavam.removeAttribute('disabled');
            campoRenavam.value = item.renavam||'';
            campoRenavam.dispatchEvent(new Event('input',{bubbles:true}));
            campoRenavam.dispatchEvent(new Event('change',{bubbles:true}));
            campoRenavam.dispatchEvent(new Event('blur',{bubbles:true}));
            setTimeout(function(){
              var placa   = campoPlaca.value.toUpperCase();
              var renavam = campoRenavam.value;
              U.box(st, true, 'Verificando... aguardando portal (pode aparecer popup)');
              jq.ajax({
                type:'GET', url:'/Veiculo/BuscarVeiculo', cache:false,
                data:{ placa:placa, renavam:renavam },
                success: function(){ setTimeout(function(){ if(btnVerificar) btnVerificar.click(); }, 500); },
                error:   function(){ setTimeout(function(){ if(btnVerificar) btnVerificar.click(); }, 500); }
              });
              monitorarPopupsVeiculo(st, function(){
                var campoTara = document.getElementById('Tara');
                if(campoTara && (!campoTara.value || campoTara.value==='')){
                  campoTara.removeAttribute('disabled');
                  campoTara.value = '2';
                  jq(campoTara).trigger('input').trigger('change');
                }
                setTimeout(function(){
                  var btnS = document.querySelector('.btn-salvar-veiculo') || document.querySelector('.btn-confirmar-inclusao');
                  if(btnS){ btnS.removeAttribute('disabled'); btnS.click(); U.box(st, true, 'Veiculo salvo! Placa: <b>'+campoPlaca.value+'</b>'); }
                  else U.box(st, false, 'Botao Salvar nao encontrado. Salve manualmente.');
                }, 800);
              });
            }, 400);
          }, 300);
          return;
        }
        var ch = placaVal[i];
        campoPlaca.value = placaVal.substring(0,i+1);
        campoPlaca.dispatchEvent(new Event('input',{bubbles:true}));
        campoPlaca.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++;
        setTimeout(proxChar, i===4?150:80);
      }
      proxChar();
    }

    if(isMovimentacao && popupAberto && ehPopupVeiculo){
      // Movimentacao: popup ja aberto, preenche direto sem mudar de aba
      U.box(st, true, 'Preenchendo veiculo no popup...');
      preencher();
    } else {
      // Cadastro normal: abre o popup primeiro
      var btnAdicionar = document.querySelector('[data-action*="VeiculoPedido/Novo"]');
      if(!btnAdicionar) return U.box(st, false, 'Botao "Adicionar Veiculo" nao encontrado.');
      U.box(st, true, 'Abrindo formulario do veiculo...');
      btnAdicionar.click();
      setTimeout(preencher, 1500);
    }
  };

})();
