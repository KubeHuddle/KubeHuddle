import { PagesDomain } from "@cdktf/provider-cloudflare/lib/pages-domain";
import { PagesProject } from "@cdktf/provider-cloudflare/lib/pages-project";
import { CloudflareProvider } from "@cdktf/provider-cloudflare/lib/provider";
import { Record } from "@cdktf/provider-cloudflare/lib/record";
import { Ruleset } from "@cdktf/provider-cloudflare/lib/ruleset";
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

		const www = new Record(this, "www", {
			zoneId: zone.id,
			name: "www",
			type: "A",
			proxied: true,
			ttl: 1,
			value: "192.0.2.1",
			comment: "Managed by Terraform",
		});

		new Ruleset(this, "www-ruleset", {
			zoneId: zone.id,
			name: "www-to-apex",
			phase: "http_request_dynamic_redirect",
			kind: "zone",

			dependsOn: [www],

			rules: [
				{
					action: "redirect",
					expression: 'http.host eq "www.kubehuddle.com"',
					enabled: true,
					actionParameters: [
						{
							fromValue: [
								{
									targetUrl: [
										{
											value: "https://kubehuddle.com",
										},
									],
									preserveQueryString: true,
									statusCode: 301,
								},
							],
						},
					],
				},
			],
		});

		new Record(this, "mx1", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			ttl: 3600,
			priority: 1,
			value: "aspmx.l.google.com.",
			comment: "Managed by Terraform",
		});

		new Record(this, "mx2", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			ttl: 3600,
			priority: 5,
			value: "alt1.aspmx.l.google.com.",
			comment: "Managed by Terraform",
		});

		new Record(this, "mx3", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			ttl: 3600,
			priority: 5,
			value: "alt2.aspmx.l.google.com.",
			comment: "Managed by Terraform",
		});

		new Record(this, "mx4", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			ttl: 3600,
			priority: 10,
			value: "alt3.aspmx.l.google.com.",
			comment: "Managed by Terraform",
		});

		new Record(this, "mx5", {
			zoneId: zone.id,
			name: "@",
			type: "MX",
			ttl: 3600,
			priority: 10,
			value: "alt4.aspmx.l.google.com.",
			comment: "Managed by Terraform",
		});

		const domainKey =
			"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuG5rTFh6X3Yu08pueSQUc8G3NCno7I4DnLH4QiKx2yMj3+7+F+qTpsyKPpn7IjxQfRDO5zHvr29LuMMcpO4rNACOUQ1zGOfMwTq1F9Shs8A291H1RWEAKT2D6FAaT2dJmEIal7R+0yWNKSZJj7HktNQaoTqKPMVgowwVzQnZgklMtZYiCGoaCRRFCWTiPiW6861hdBNCQv445WhwkNc7A5G4bDn9w5NkH1R2VDQ4pnTc9l+ogqR+Dp/s78C/r2bstFBOd9eyRng1SYYWlkH8Kt2MxAXG/o2GiZOj2KZow79IvjzhJU4sfp3tUnj36gnK99vX3EH5K5fmvzQV9/PNpwIDAQAB";

		new Record(this, "dkim", {
			zoneId: zone.id,
			name: "google._domainkey",
			type: "TXT",
			value: `v=DKIM1; k=rsa; p=${domainKey}`,
		});

		new Record(this, "spf", {
			zoneId: zone.id,
			name: "@",
			type: "TXT",
			value: "v=spf1 include:_spf.google.com",
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
