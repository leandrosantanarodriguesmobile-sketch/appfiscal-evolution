# Evolution API remendado pro AppFiscal CRM

Fork de `evolution-foundation/evolution-api` na tag **2.3.7** (branch `crm-2.3.7`) com dois remendos
de etiquetas, só no canal Baileys (`src/api/integrations/channel/whatsapp/whatsapp.baileys.service.ts`):

1. `GET /label/syncLabels/{instance}` — `resyncAppState(['regular'], false)`: pede ao WhatsApp os
   patches incrementais de etiquetas/associações sem reconectar; os eventos `LABELS_EDIT` e
   `LABELS_ASSOCIATION` saem pelo webhook. (PR upstream #2421, não incorporado.)
2. `POST /label/handleLabel` aplica a etiqueta no **LID** do contato (`signalRepository.lidMapping.getLIDForPN`)
   em vez do jid de número, que o celular ignora; aceita `number` já em `@lid`. (Issues #2524 / #1872.)

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
