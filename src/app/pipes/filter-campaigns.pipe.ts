import { Pipe, PipeTransform } from '@angular/core';
import { CampaignDto } from '../services/marketing.service'; // Adjust path as needed

@Pipe({
  name: 'filterCampaigns',
  standalone: true // Mark as standalone
})
export class FilterCampaignsPipe implements PipeTransform {

  transform(campaigns: CampaignDto[], typeToFilter: string): CampaignDto[] {
    if (!campaigns || !typeToFilter) {
      return campaigns;
    }
    return campaigns.filter(campaign => campaign.type === typeToFilter);
  }
}
