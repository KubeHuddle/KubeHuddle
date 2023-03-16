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

		new CloudflareProvider(this, "cloudflare", {});

		const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;

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
			ttl: 3600,
			priority: 10,
			value: "in1-smtp.messagingengine.com.",
		});

		new Record(this, "mx2", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			ttl: 3600,
			priority: 20,
			value: "in2-smtp.messagingengine.com.",
		});

		new Record(this, "spf", {
			zoneId: zone.id,
			name: "@",
			type: "TXT",
			ttl: 3600,
			value: '"v=spf1 include:spf.messagingengine.com ~all"',
		});

		for (let i = 1; i <= 3; i++) {
			new Record(this, `dkim${i}`, {
				zoneId: zone.id,
				name: `fm${i}._domainkey`,
				type: "CNAME",
				ttl: 3600,
				value: `fm${i}.${zone.zone}.dkim.fmhosted.com`,
			});
		}

		// new Record(this, "srv-submission", {
		// 	zoneId: zone.id,
		// 	name: "_submission._tcp",
		// 	type: "SRV",
		// 	value: "0 1 587 smtp.fastmail.com",
		// });

		// new Record(this, "srv-imap", {
		// 	zoneId: zone.id,
		// 	name: "_imap._tcp",
		// 	type: "SRV",
		// 	value: "0 0 0 .",
		// });

		// new Record(this, "srv-imaps", {
		// 	zoneId: zone.id,
		// 	name: "_imaps._tcp",
		// 	type: "SRV",
		// 	value: "0 0 0 imap.fastmail.com",
		// });

		// new Record(this, "srv-jmap", {
		// 	zoneId: zone.id,
		// 	name: "_jmap._tcp",
		// 	type: "SRV",
		// 	value: "0 1 443 api.fastmail.com",
		// });

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
