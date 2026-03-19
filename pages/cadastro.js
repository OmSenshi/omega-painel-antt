// pages/cadastro.js — modulo: Novo Cadastro de Transportador
(function(){
  var U  = window.OmegaUtils;
  var jq = window.OmegaJQ;

  // CEPs aleatorios por estado (logradouro, numero e bairro serao zerados pelo script)
  var CEPS = {
    MG: ['30110-010','30130-010','30140-070','30150-320','32310-060'],
    SP: ['01001-000','01310-100','01320-000','01410-001','01530-001'],
    RJ: ['20040-020','20050-090','20090-003','20211-110','20231-092']
  };

  function cepAleatorio(estado) {
    var lista = CEPS[estado];
    return lista[Math.floor(Math.random() * lista.length)];
  }

  // Detecta em qual aba o usuario esta
  function abaAtiva() {
    var tab = document.querySelector('.nav-tabs .nav-link.active');
    return tab ? tab.getAttribute('href') : '';
  }

  // Detecta se e CPF ou CNPJ pelo campo oculto
  function tipoCadastro() {
    var cnpj = document.getElementById('CpfCnpjTransportador');
    if(!cnpj || !cnpj.value) return 'CPF';
    return cnpj.value.replace(/\D/g,'').length === 14 ? 'CNPJ' : 'CPF';
  }

  // Obtem o codigo do pedido da URL
  function codigoPedido() {
    var m = window.location.pathname.match(/\/Pedido\/([A-F0-9]+)/i);
    return m ? m[1] : '';
  }

  // ── HTML do painel ───────────────────────────────────────────────
  U.addSecao(''
    // Aba Contatos
    +'<div id="omega-cad-contatos">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Endereco</div>'
      +'<div style="font-size:11px;color:#555;margin-bottom:6px">Selecione o estado para preencher o endereco automaticamente:</div>'
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

    // Aba Responsavel Tecnico
    +'<div id="omega-cad-rt" style="display:none">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Responsavel Tecnico</div>'
      +'<button id="omega-rt-btn" style="width:100%;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar RT</button>'
      +'<div id="omega-rt-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
    +'</div>'

    // Aba Veiculo
    +'<div id="omega-cad-veiculo" style="display:none">'
      +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Veiculo</div>'
      +'<div id="omega-veiculo-hist" style="max-height:200px;overflow-y:auto;margin-bottom:8px"></div>'
      +'<div id="omega-veiculo-vazio" style="font-size:11px;color:#aaa;text-align:center;padding:10px 0">Nenhum veiculo no historico</div>'
      +'<div id="omega-veiculo-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
    +'</div>'
  );

  // ── Detecta aba ativa e mostra secao correta ──────────────────────
  function tipoPedido() {
    var el = document.querySelector('.main_content');
    return el ? el.getAttribute('data-tipo-pedido') : '';
  }

  function atualizarSecao() {
    var aba = abaAtiva();
    var isMovimentacao = tipoPedido() === 'MovimentacaoFrota';

    // Em movimentacao de frota so tem aba veiculo — mostra direto
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

  // Observa mudanca de aba
  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab', atualizarSecao);
    link.addEventListener('click', function(){ setTimeout(atualizarSecao, 300); });
  });
  atualizarSecao();

  // ── CEP / Endereco ────────────────────────────────────────────────
  function preencherEndereco(estado) {
    var st = document.getElementById('omega-cep-status');
    var cep = cepAleatorio(estado);

    // Abre o modal de endereco clicando em "Adicionar Endereco"
    var btnAdicionar = document.querySelector('[data-action*="EnderecoPedido/Novo"]');
    if(!btnAdicionar) return U.box(st, false, 'Botao "Adicionar Endereco" nao encontrado. Abra a aba Contatos.');

    U.box(st, true, 'Abrindo formulario de endereco...');
    btnAdicionar.click();

    // Aguarda o modal abrir
    setTimeout(function(){
      var campoCep      = document.getElementById('Cep');
      var campoTipo     = document.getElementById('CodigoTipoEndereco');

      if(!campoCep) return U.box(st, false, 'Modal de endereco nao abriu. Tente novamente.');

      // Seleciona tipo Correspondencia
      if(campoTipo) {
        campoTipo.value = 'COR';
        jq(campoTipo).trigger('change');
      }

      // Preenche CEP e dispara busca
      campoCep.value = cep;
      jq(campoCep).trigger('change').trigger('blur');

      U.box(st, true, 'CEP '+cep+' ('+estado+') inserido. Aguardando portal buscar endereco...');

      // Aguarda portal preencher logradouro/bairro automaticamente
      setTimeout(function(){
        var campoLogradouro = document.getElementById('Logradouro');
        var campoNumero     = document.getElementById('Numero');
        var campoBairro     = document.getElementById('Bairro');

        if(campoLogradouro) { campoLogradouro.value = '0'; jq(campoLogradouro).trigger('input').trigger('change'); }
        if(campoNumero)     { campoNumero.value = '0';     jq(campoNumero).trigger('input').trigger('change'); }
        if(campoBairro)     { campoBairro.value = '0';     jq(campoBairro).trigger('input').trigger('change'); }

        // Marca checkbox "mesmo endereco comercial"
        setTimeout(function(){
          // Checkbox pode ter varios seletores dependendo do portal
          var checks = document.querySelectorAll('input[type="checkbox"]');
          var marcou = false;
          checks.forEach(function(cb){
            var label = cb.closest('label') || cb.parentElement;
            var txt = label ? label.textContent : '';
            if(txt.toLowerCase().includes('mesmo') || txt.toLowerCase().includes('comercial')){
              if(!cb.checked){ cb.checked = true; jq(cb).trigger('change').trigger('click'); }
              marcou = true;
            }
          });

          // Clica em Salvar
          setTimeout(function(){
            var btnSalvar = document.querySelector('.btn-salvar-endereco');
            if(btnSalvar){
              btnSalvar.click();
              U.box(st, true, 'Endereco ('+estado+' / CEP '+cep+') salvo!');
            } else {
              U.box(st, false, 'Botao Salvar nao encontrado. Verifique o formulario.');
            }
          }, 500);
        }, 800);
      }, 2000);
    }, 1000);
  }

  document.getElementById('omega-cep-mg').addEventListener('click', function(){ preencherEndereco('MG'); });
  document.getElementById('omega-cep-sp').addEventListener('click', function(){ preencherEndereco('SP'); });
  document.getElementById('omega-cep-rj').addEventListener('click', function(){ preencherEndereco('RJ'); });

  // ── Contato (Telefone + Email) ────────────────────────────────────
  document.getElementById('omega-contato-btn').addEventListener('click', function(){
    var st = document.getElementById('omega-contato-status');
    var tipo = tipoCadastro();

    if(tipo === 'CPF'){
      U.box(st, true, 'CPF detectado — contatos ja vem preenchidos pelo portal. Nenhuma acao necessaria.');
      return;
    }

    // CNPJ: adiciona Telefone e Email
    U.box(st, true, 'Adicionando telefone...');
    adicionarContato('2', '0000000000', function(okTel){
      if(!okTel){ U.box(st, false, 'Erro ao adicionar telefone.'); return; }

      setTimeout(function(){
        // Gera email aleatorio
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var email = '';
        for(var i=0; i<12; i++) email += chars[Math.floor(Math.random()*chars.length)];
        email += '@yahoo.com';

        adicionarContato('4', email, function(okEmail){
          if(okEmail) U.box(st, true, 'Telefone e email adicionados!<br><span style="font-size:10px;color:#555">Tel: (00) 0000-0000 | Email: '+email+'</span>');
          else U.box(st, false, 'Telefone ok, mas erro ao adicionar email.');
        });
      }, 1500);
    });
  });

  function adicionarContato(tipoValor, contatoValor, callback) {
    var btnAdicionar = document.querySelector('[data-action*="ContatoPedido/Novo"]');
    if(!btnAdicionar){ callback(false); return; }

    btnAdicionar.click();
    setTimeout(function(){
      var campoTipo    = document.getElementById('CodigoTipoContato');
      var campoContato = document.getElementById('Contato');
      if(!campoTipo || !campoContato){ callback(false); return; }

      campoTipo.value = tipoValor;
      jq(campoTipo).trigger('change');

      setTimeout(function(){
        campoContato.value = contatoValor;
        jq(campoContato).trigger('input').trigger('change');

        setTimeout(function(){
          var btnSalvar = document.querySelector('.btn-salvar-contato');
          if(btnSalvar){ btnSalvar.click(); callback(true); }
          else callback(false);
        }, 400);
      }, 300);
    }, 800);
  }

  // ── Responsavel Tecnico ───────────────────────────────────────────
  var CPF_RT = '071.417.536-64';

  document.getElementById('omega-rt-btn').addEventListener('click', function(){
    var st = document.getElementById('omega-rt-status');
    var btnAdicionar = document.querySelector('[data-action*="ResponsavelTecnico/Criar"]');
    if(!btnAdicionar) return U.box(st, false, 'Botao "Adicionar RT" nao encontrado.');

    U.box(st, true, 'Abrindo formulario do RT...');
    btnAdicionar.click();

    setTimeout(function(){
      var campoCpf = document.getElementById('Cpf');
      if(!campoCpf) return U.box(st, false, 'Modal do RT nao abriu. Tente novamente.');

      // Digita o CPF do RT
      campoCpf.value = CPF_RT;
      jq(campoCpf).trigger('input').trigger('change').trigger('blur');

      U.box(st, true, 'CPF do RT inserido. Aguardando portal carregar dados...');

      // Aguarda portal buscar os dados do CPF
      var tentativas = 0;
      var intervalo = setInterval(function(){
        tentativas++;
        var btnSalvar = document.getElementById('btnSalvar');
        var campoNome = document.getElementById('Nome');

        // Verifica se os dados foram carregados (campo nome preenchido)
        var nomePreenchido = campoNome && campoNome.value && campoNome.value.trim() !== '';

        if(nomePreenchido || tentativas > 15){
          clearInterval(intervalo);
          if(!nomePreenchido){
            U.box(st, false, 'Portal demorou para carregar dados. Marque as caixas e salve manualmente.');
            return;
          }

          // Marca os dois checkboxes
          var cbFoi     = document.getElementById('FoiResponsavelTecnico');
          var cbIdoneo  = document.getElementById('isDeclaracaoIdoneoArtigo2');

          function marcarICheck(cb){
            if(!cb) return;
            // iCheck usa elemento visual, precisa disparar via jQuery
            jq(cb).iCheck('check');
            cb.checked = true;
            jq(cb).trigger('ifChecked').trigger('change');
          }

          marcarICheck(cbFoi);
          marcarICheck(cbIdoneo);

          setTimeout(function(){
            if(btnSalvar && !btnSalvar.disabled){
              btnSalvar.click();
              U.box(st, true, 'RT adicionado! CPF: '+CPF_RT);
            } else {
              // Tenta remover disabled e clicar
              if(btnSalvar){
                btnSalvar.removeAttribute('disabled');
                btnSalvar.click();
                U.box(st, true, 'RT salvo! CPF: '+CPF_RT);
              } else {
                U.box(st, false, 'Botao Salvar ainda desabilitado. Marque as caixas e salve manualmente.');
              }
            }
          }, 600);
        }
      }, 500);
    }, 1000);
  });

  // ── Veiculo (historico do arrendamento) ───────────────────────────
  var HIST_KEY = 'omega_historico';

  function carregarHistorico(){
    try{
      var raw = (typeof GM_getValue !== 'undefined') ? GM_getValue(HIST_KEY,'[]') : localStorage.getItem(HIST_KEY)||'[]';
      var lista = JSON.parse(raw);
      var agora = Date.now();
      return lista.filter(function(item){ return (agora - item.ts) < 24*60*60*1000; });
    } catch(e){ return []; }
  }

  function renderHistoricoVeiculo(){
    var lista  = carregarHistorico();
    var el     = document.getElementById('omega-veiculo-hist');
    var vazio  = document.getElementById('omega-veiculo-vazio');
    if(!el) return;
    if(lista.length === 0){
      el.innerHTML = '';
      if(vazio) vazio.style.display = 'block';
      return;
    }
    if(vazio) vazio.style.display = 'none';
    el.innerHTML = lista.map(function(item, idx){
      var p = item.placa || '';
      var display = /^[A-Z]{3}[0-9]{4}$/.test(p) ? p.substring(0,3)+'-'+p.substring(3) : p;
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0">'
        +'<div style="font-size:12px;font-weight:bold;color:#333">'+display+'</div>'
        +'<button onclick="OmegaUsarVeiculoCad('+idx+')" style="padding:5px 10px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">Usar</button>'
      +'</div>';
    }).join('');
  }

  // ── Monitor de popups apos verificar veiculo ──────────────────
  function monitorarPopupsVeiculo(st, campoPlaca, callback) {
    var tentativas = 0;
    var maxTentativas = 20; // 20 x 300ms = 6 segundos de espera maxima

    var intervalo = setInterval(function(){
      tentativas++;

      // ── Popup 1: bootbox "Movimentacao de Frota" (Nao / Sim) ──
      var bootboxSim = document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');
      if(bootboxSim && bootboxSim.offsetParent !== null){
        clearInterval(intervalo);
        U.box(st, true, 'Popup detectado! Confirmando em 3s...');
        setTimeout(function(){
          bootboxSim.click();
          U.box(st, true, 'Confirmado! Aguardando popup de exclusao...');

          // ── Popup 2: Pedido de Movimentacao de Frota (Confirmar Exclusao) ──
          setTimeout(function(){
            var tentativas2 = 0;
            var intervalo2 = setInterval(function(){
              tentativas2++;
              var btnConfirmarExclusao = document.querySelector('.btn-confirmar-exclusao');
              // Verifica se o modal de movimentacao esta visivel (tem titulo "Pedido de Movimentacao")
              var modalMovimentacao = document.querySelector('#manterVeiculoModal');
              var tituloModal = modalMovimentacao ? modalMovimentacao.querySelector('.modal-title') : null;
              var ehModalMovimentacao = tituloModal && tituloModal.textContent.indexOf('Movimenta') !== -1;
              var modalVisivel = modalMovimentacao && (modalMovimentacao.style.display === 'block' || modalMovimentacao.classList.contains('show'));

              if(btnConfirmarExclusao && ehModalMovimentacao && modalVisivel){
                clearInterval(intervalo2);
                U.box(st, true, 'Confirmando exclusao da frota anterior...');
                setTimeout(function(){
                  btnConfirmarExclusao.click();
                  U.box(st, true, 'Excluido! Aguardando incluir na nova frota...');

                  // Aguarda aba "Incluir" e clica em Confirmar Inclusao
                  setTimeout(function(){
                    var btnConfirmarInclusao = document.querySelector('#manterVeiculoModal .btn-confirmar-inclusao');
                    if(btnConfirmarInclusao){
                      btnConfirmarInclusao.click();
                      U.box(st, true, 'Incluido na frota! Aguardando...');
                    }
                    setTimeout(function(){ callback(); }, 1500);
                  }, 1500);
                }, 500);
              } else if(tentativas2 >= 15){
                clearInterval(intervalo2);
                // Popup 2 nao apareceu — segue normalmente
                callback();
              }
            }, 300);
          }, 1500);
        }, 3000);
        return;
      }

      // Sem popup — verifica se Chassi foi preenchido (verificacao concluida)
      var campoChassi = document.getElementById('Chassi');
      if(campoChassi && campoChassi.value && campoChassi.value.trim() !== ''){
        clearInterval(intervalo);
        callback();
        return;
      }

      if(tentativas >= maxTentativas){
        clearInterval(intervalo);
        // Tenta salvar mesmo assim
        callback();
      }
    }, 300);
  }

  unsafeWindow.OmegaUsarVeiculoCad = function(idx){
    var st    = document.getElementById('omega-veiculo-status');
    var lista = carregarHistorico();
    var item  = lista[idx];
    if(!item) return U.box(st, false, 'Item nao encontrado.');

    var btnAdicionar = document.querySelector('[data-action*="VeiculoPedido/Novo"]');
    if(!btnAdicionar) return U.box(st, false, 'Botao "Adicionar Veiculo" nao encontrado.');

    U.box(st, true, 'Abrindo formulario do veiculo...');
    btnAdicionar.click();

    setTimeout(function(){
      var campoPlaca   = document.getElementById('Placa');
      var campoRenavam = document.getElementById('Renavam');
      var btnVerificar = document.getElementById('verificar');

      if(!campoPlaca || !campoRenavam) return U.box(st, false, 'Modal do veiculo nao abriu.');

      var placaVal = (item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();

      U.box(st, true, 'Preenchendo placa...');

      // Digita placa com delay (mesmo metodo do arrendamento)
      campoPlaca.removeAttribute('disabled');
      campoPlaca.value = '';
      campoPlaca.focus();
      campoPlaca.dispatchEvent(new Event('focus', {bubbles:true}));

      var i = 0;
      function proxChar(){
        if(i >= placaVal.length){
          campoPlaca.dispatchEvent(new Event('change', {bubbles:true}));
          campoPlaca.dispatchEvent(new Event('blur', {bubbles:true}));

          // Preenche Renavam
          setTimeout(function(){
            campoRenavam.removeAttribute('disabled');
            campoRenavam.value = item.renavam || '';
            campoRenavam.dispatchEvent(new Event('input',  {bubbles:true}));
            campoRenavam.dispatchEvent(new Event('change', {bubbles:true}));
            campoRenavam.dispatchEvent(new Event('blur',   {bubbles:true}));

            // Clica em Verificar via AJAX (mesmo metodo do arrendamento)
            setTimeout(function(){
              var placa   = campoPlaca.value.toUpperCase();
              var renavam = campoRenavam.value;
              var cpf     = (document.getElementById('CpfCnpjTransportador')||{}).value || '';

              jq.ajax({
                type:'GET', url:'/Veiculo/BuscarVeiculo', cache:false,
                data:{ placa:placa, renavam:renavam },
                success: function(){
                  if(btnVerificar) btnVerificar.click();
                  U.box(st, true, 'Verificando veiculo... aguardando portal (pode aparecer popup de confirmacao)');

                  // Inicia monitoramento de popups de confirmacao
                  monitorarPopupsVeiculo(st, campoPlaca, function(){
                    // Callback apos confirmar tudo — preenche Tara e salva
                    var campoTara = document.getElementById('Tara');
                    if(campoTara && (!campoTara.value || campoTara.value === '')){
                      campoTara.removeAttribute('disabled');
                      campoTara.value = '2';
                      jq(campoTara).trigger('input').trigger('change');
                    }
                    setTimeout(function(){
                      var btnSalvar = document.querySelector('.btn-salvar-veiculo');
                      if(btnSalvar){
                        btnSalvar.removeAttribute('disabled');
                        btnSalvar.click();
                        U.box(st, true, 'Veiculo salvo! Placa: <b>'+campoPlaca.value+'</b>');
                      } else {
                        U.box(st, false, 'Botao Salvar nao encontrado. Salve manualmente.');
                      }
                    }, 800);
                  });
                },
                error: function(){
                  if(btnVerificar) btnVerificar.click();
                  U.box(st, true, 'Verificando veiculo...');
                  monitorarPopupsVeiculo(st, campoPlaca, function(){
                    var campoTara = document.getElementById('Tara');
                    if(campoTara && (!campoTara.value || campoTara.value === '')){
                      campoTara.removeAttribute('disabled');
                      campoTara.value = '2';
                      jq(campoTara).trigger('input').trigger('change');
                    }
                    setTimeout(function(){
                      var btnSalvar = document.querySelector('.btn-salvar-veiculo');
                      if(btnSalvar){
                        btnSalvar.removeAttribute('disabled');
                        btnSalvar.click();
                        U.box(st, true, 'Veiculo salvo! Placa: <b>'+campoPlaca.value+'</b>');
                      }
                    }, 800);
                  });
                }
              });
            }, 400);
          }, 300);
          return;
        }

        var ch = placaVal[i];
        campoPlaca.value = placaVal.substring(0, i+1);
        campoPlaca.dispatchEvent(new Event('input', {bubbles:true}));
        campoPlaca.dispatchEvent(new KeyboardEvent('keyup', {bubbles:true, cancelable:true, key:ch}));
        i++;
        setTimeout(proxChar, i===4 ? 150 : 80);
      }
      proxChar();
    }, 800);
  };

})();
