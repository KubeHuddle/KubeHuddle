import { PagesDomain } from "@cdktf/provider-cloudflare/lib/pages-domain";
import { PagesProject } from "@cdktf/provider-cloudflare/lib/pages-project";
import { CloudflareProvider } from "@cdktf/provider-cloudflare/lib/provider";
import { Record } from "@cdktf/provider-cloudflare/lib/record";
import { Zone } from "@cdktf/provider-cloudflare/lib/zone";
import { App, CloudBackend, NamedCloudWorkspace, TerraformStack } from "cdktf";
import { Construct } from "constructs";

class MyStack extends TerraformStack {
	constructor(scope: Construct, id: string) {
		super(scope, id);

		const accountId = "48cdf6654836e299e22f3448ca02ea21";

		new CloudflareProvider(this, "cloudflare", {
			accountId,
		});

		const zone = new Zone(this, "zone", {
			zone: "kubehuddle.com",
			accountId,
		});

		const pagesProject = new PagesProject(this, "project", {
			name: "kubehuddle",
			accountId,
			productionBranch: "main",
			deploymentConfigs: {
				preview: {
					alwaysUseLatestCompatibilityDate: false,
					compatibilityDate: "2023-01-19",
					failOpen: false,
					usageModel: "bundled",
				},
				production: {
					alwaysUseLatestCompatibilityDate: false,
					compatibilityDate: "2023-01-19",
					failOpen: false,
					usageModel: "bundled",
				},
			},
		});

		new PagesDomain(this, "domain", {
			projectName: pagesProject.name,
			domain: "kubehuddle.com",
			accountId,
		});

		new Record(this, "mx1", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			value: "aspmx.l.google.com",
			priority: 1,
		});

		new Record(this, "mx2", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			value: "alt1.aspmx.l.google.com",
			priority: 5,
		});

		new Record(this, "mx3", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			value: "alt2.aspmx.l.google.com",
			priority: 5,
		});

		new Record(this, "mx4", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			value: "alt3.aspmx.l.google.com",
			priority: 10,
		});

		new Record(this, "mx5", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			value: "alt4.aspmx.l.google.com",
			priority: 10,
		});

		new Record(this, "spf", {
			zoneId: zone.id,
			name: "@",
			type: "TXT",
			value: "v=spf1 include:_spf.google.com -all",
		});

		new Record(this, "google-site-verification", {
			zoneId: zone.id,
			name: "@",
			type: "TXT",
			value:
				"google-site-verification=scVX5_lm1ntP5So-r8ck3dQrx6M1YZVkMXH-q_vTfd8",
		});
	}
}

const app = new App();
const stack = new MyStack(app, "kubehuddle");

new CloudBackend(stack, {
	hostname: "app.terraform.io",
	organization: "KubeHuddle",
	workspaces: new NamedCloudWorkspace("infrastructure"),
});

app.synth();
