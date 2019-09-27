import { Injectable } from '@angular/core';
import { ConfigurationService } from '../../widgets/services/mvd-configuration-service';
import * as models from '../shared/mvd-mobile-models';

@Injectable()
export class AttentionNoticesMobileConfiguratonService {
    private widgetConfigKey = 'attentionNoticesMobileSettings';
    private currentVersion = '1.1';

    constructor(private configurationService: ConfigurationService) {
    }

    /**
     * Gets the saved Attention Notices mobile configuration.
     * If no configuration is saved, returns undefined
     */
    getConfiguration(): models.AttentionNoticesConfiguration {
        const sessionConfig = this.configurationService.getConfiguration(this.widgetConfigKey) as models.AttentionNoticesConfiguration;
        if (!sessionConfig) { return sessionConfig; }

        if (sessionConfig.hasOwnProperty('version') && sessionConfig.version !== this.currentVersion) {
            this.configurationService.setUserConfiguration(null, this.widgetConfigKey);
            return null;
        }
        return sessionConfig;
    }

    /**
     * Gets the saved Attention Notices mobile configuration.
     * If no configuration is saved, returns the default values
     */
    ensureConfiguration(): models.AttentionNoticesConfiguration {
        let sessionConfig = this.configurationService.getConfiguration(this.widgetConfigKey) as models.AttentionNoticesConfiguration;
        if (sessionConfig) { return sessionConfig; }

        sessionConfig = this.getDefaultConfiguration();
        this.configurationService.setUserConfiguration(sessionConfig, this.widgetConfigKey);
        return sessionConfig;
    }

    /**
     * Preserves the Attention Notices mobile configuration
     * @param config Attention Notices mobile configuration to be preserved
     */
    saveConfiguration(config: models.AttentionNoticesConfiguration) {
        config.version = this.currentVersion;
        this.configurationService.setUserConfiguration(config, this.widgetConfigKey);
    }

    /**
     * Saves sorting configuration portion
     * @param sortItem Sorting information to be preserved
     */
    saveSortingConfiguration(noticeKey: string, sortItem: models.AttentionNoticeSortConfiguration): void {
        const config = this.getConfiguration();
        config.sortConfig[noticeKey] = sortItem;
        this.saveConfiguration(config);
    }

    /**
     * Gets the default session configuration for Attention Notices mobile
     */
    getDefaultConfiguration(): models.AttentionNoticesConfiguration {
        return <models.AttentionNoticesConfiguration>{
            version: this.currentVersion,
            sortConfig: {}
        };
    }

    /**
     * Gets an array of the possible field names (another array) for ordering attention notices
     */
    getDefaultSortingIds(): string[] {
        return ['age', 'device'];
    }
}
