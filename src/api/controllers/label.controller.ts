import { InstanceDto } from '@api/dto/instance.dto';
import { HandleLabelDto } from '@api/dto/label.dto';
import { WAMonitoringService } from '@api/services/monitor.service';

export class LabelController {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public async fetchLabels({ instanceName }: InstanceDto) {
    return await this.waMonitor.waInstances[instanceName].fetchLabels();
  }

  public async handleLabel({ instanceName }: InstanceDto, data: HandleLabelDto) {
    return await this.waMonitor.waInstances[instanceName].handleLabel(data);
  }

  /** [AppFiscal CRM] força o WhatsApp a reenviar etiquetas e associações (sem reconectar). */
  public async syncLabels({ instanceName }: InstanceDto, full = false) {
    return await this.waMonitor.waInstances[instanceName].syncLabels(full);
  }
}
