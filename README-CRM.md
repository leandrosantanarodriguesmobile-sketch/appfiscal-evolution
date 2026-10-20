# Evolution API remendado pro AppFiscal CRM

Fork de `evolution-foundation/evolution-api` na tag **2.3.7** (branch `crm-2.3.7`) com três remendos
de etiquetas:

1. `GET /label/syncLabels/{instance}[?full=true]` (`whatsapp.baileys.service.ts`) — `resyncAppState` das
   5 coleções do estado do app sem reconectar; os eventos `LABELS_EDIT` e `LABELS_ASSOCIATION` saem pelo
   webhook. Com `full=true` zera as versões guardadas (`app-state-sync-version`) e pede o retrato inteiro —
   necessário quando o servidor responde `404 item-not-found` porque a versão guardada ficou velha demais
   (o Baileys rc.9 desiste em silêncio). (PR upstream #2421, não incorporado.)
2. `POST /label/handleLabel` aplica a etiqueta no **LID** do contato (`signalRepository.lidMapping.getLIDForPN`)
   em vez do jid de número, que o celular ignora; aceita `number` já em `@lid`. (Issues #2524 / #1872.)
3. `src/utils/use-multi-file-auth-state-*.ts` — chave `app-state-sync-key` reconstruída com
   `AppStateSyncKeyData.fromObject` em vez de `create`. O `keyData` volta do Redis/arquivo como texto base64
   (o `toJSON` do protobuf roda antes do `BufferJSON.replacer`) e `create()` o deixa string; o Baileys
   derivava as chaves de MAC/criptografia dos bytes errados e **toda** sincronização de estado falhava com
   `Invalid patch mac` depois de um restart do Evolution (só funcionava logo após ler o QR, com a chave
   ainda em memória). É a causa de etiquetas do celular não chegarem e de `handleLabel` não pegar.

## Construir e publicar

A VM de 2 GB não aguenta o build (esbuild é morto por falta de memória). O workflow
`build-crm-image.yml` constrói no GitHub e manda `appfiscal-evolution-crm.tgz` (docker save) pra
`crm@34.39.238.140:/home/crm/`. De lá, pra VM `evolution-api` (rede interna 10.158.0.3):

```bash
# na VM appfiscal-crm: servir o arquivo por HTTP interno (temporário)
cd /home/crm && python3 -m http.server 8099 --bind 10.158.0.4 &

# na VM evolution-api
curl -s http://10.158.0.4:8099/appfiscal-evolution-crm.tgz | gunzip | sudo docker load
cd /opt/evolution && sudo sed -i 's#image: evoapicloud/evolution-api:latest#image: appfiscal-evolution:crm#' docker-compose.yml
sudo docker compose up -d evolution
curl -s http://127.0.0.1:8080/ | head -c 120
```

Voltar pro oficial: trocar a `image:` de volta e `docker compose up -d`.

## Atualizar pra uma versão nova do Evolution

`git fetch upstream && git checkout -b crm-<versao> <tag>` e reaplicar os dois remendos (são ~60 linhas).
Quando o upstream incorporar as correções, apagar o fork e usar a imagem oficial.
