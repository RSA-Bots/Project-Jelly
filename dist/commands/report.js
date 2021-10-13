"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const globals_1 = require("../globals");
const report = {
    name: "report",
    interaction: {
        description: "Create a report against a user.",
        options: [
            {
                type: "USER",
                name: "user",
                description: "The user to report.",
                required: true,
            },
            {
                type: "STRING",
                name: "reason",
                description: "Additional context to the problem in the form of a description or screenshot.",
                required: true,
            },
        ],
        defaultPermission: true,
        enabled: true,
        callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (!interaction.guildId ||
                !interaction.guild ||
                !interaction.member ||
                !("displayColor" in interaction.member) ||
                !report.buttons)
                return;
            const guild = yield (0, globals_1.getGuild)(interaction.guildId);
            if (!guild)
                return;
            const guildInfo = globals_1.guildCache.find(guild => guild.id == interaction.guildId);
            if (!guildInfo)
                return;
            const bot = interaction.guild.me;
            const uploadChannel = (_a = (yield interaction.guild.channels.fetch(guild.settings.reports.upload))) !== null && _a !== void 0 ? _a : interaction.channel;
            if (!uploadChannel ||
                uploadChannel.type != "GUILD_TEXT" ||
                !bot ||
                !bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
                !bot.permissionsIn(uploadChannel).has("SEND_MESSAGES"))
                return;
            const newReport = {
                id: guildInfo.reports.length.toString(),
                messageId: "",
                channelId: "",
                threadId: "",
                status: "open",
                author: {
                    id: interaction.user.id,
                    time: new Date().toLocaleString(),
                },
                closed: {
                    id: "",
                    time: "",
                },
            };
            yield guild.uploadReport(newReport);
            const accusedUser = interaction.options.getUser("user");
            const reason = interaction.options.getString("reason");
            const avatarURL = interaction.user.avatarURL();
            if (!accusedUser || !reason || !avatarURL)
                return;
            const row = new discord_js_1.MessageActionRow();
            report.buttons.forEach(data => {
                if (data.button.customId == "closeReport") {
                    row.addComponents(data.button);
                }
            });
            const embed = new discord_js_1.MessageEmbed()
                .setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
                .addField("Accused", `<@${accusedUser.id}>`, true)
                .addField("Reason", reason, true)
                .addField("Status", "Open", false)
                .setFooter(`id: ${newReport.id}`)
                .setTimestamp()
                .setColor(interaction.member.displayColor)
                .setThumbnail("https://i.imgur.com/218ml3x.png");
            const message = yield uploadChannel.send({
                embeds: [embed],
                components: [row],
            });
            const thread = yield uploadChannel.threads.create({
                startMessage: message,
                name: `Report ${newReport.id}`,
                autoArchiveDuration: 1440,
                type: "GUILD_PUBLIC_THREAD",
            });
            (newReport.threadId = thread.id),
                (newReport.messageId = message.id),
                (newReport.channelId = message.channelId);
            yield guild.updateReport(newReport);
            yield interaction.reply({
                ephemeral: true,
                content: `<@${accusedUser.id}> has been reported.`,
            });
        }),
    },
    buttons: [
        {
            button: new discord_js_1.MessageButton()
                .setCustomId("closeReport")
                .setLabel("Close")
                .setStyle("DANGER")
                .setDisabled(false),
            callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
                if (!interaction.guildId || !interaction.guild)
                    return;
                const guild = yield (0, globals_1.getGuild)(interaction.guildId);
                if (!guild)
                    return;
                const cachedReport = guild.reports.find(report => report.messageId == interaction.message.id);
                if (!cachedReport)
                    return;
                const channel = yield interaction.guild.channels.fetch(cachedReport.channelId);
                if (!channel || channel.type != "GUILD_TEXT")
                    return;
                const thread = yield channel.threads.fetch(cachedReport.threadId);
                if (!thread)
                    return;
                yield interaction.deferUpdate();
                if (thread.archived == false) {
                    yield thread.setArchived(true); // Does not rely on threadUpdate due to the nature of collecting data from a closed ticket.
                }
                const message = yield channel.messages.fetch(cachedReport.messageId);
                const embed = message.embeds[0];
                const statusField = embed.fields.find(field => field.name == "Status");
                if (!statusField)
                    return;
                statusField.value = `Closed by <@${interaction.user.id}>`;
                const row = new discord_js_1.MessageActionRow();
                if (report.buttons) {
                    for (const button of report.buttons.map(data => data.button)) {
                        if (button.customId == "openReport") {
                            row.addComponents(button);
                        }
                    }
                }
                yield message.edit({
                    embeds: [embed],
                    components: [row],
                });
                cachedReport.closed = {
                    id: interaction.user.id,
                    time: new Date().toLocaleString(),
                };
                cachedReport.status = "closed";
                yield guild.updateReport(cachedReport);
            }),
            permissions: [discord_js_1.Permissions.FLAGS.MANAGE_MESSAGES],
        },
        {
            button: new discord_js_1.MessageButton()
                .setCustomId("openReport")
                .setLabel("Open")
                .setStyle("PRIMARY")
                .setDisabled(false),
            callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
                if (!interaction.guildId || !interaction.guild)
                    return;
                const guild = yield (0, globals_1.getGuild)(interaction.guildId);
                if (!guild)
                    return;
                const cachedReport = guild.reports.find(report => report.messageId == interaction.message.id);
                if (!cachedReport)
                    return;
                const channel = yield interaction.guild.channels.fetch(cachedReport.channelId);
                if (!channel || channel.type != "GUILD_TEXT")
                    return;
                const thread = yield channel.threads.fetch(cachedReport.threadId);
                if (!thread)
                    return;
                yield interaction.deferUpdate();
                if (thread.archived == true) {
                    yield thread.setArchived(false); // Relies on threadUpdate
                }
            }),
            permissions: [discord_js_1.Permissions.FLAGS.MANAGE_MESSAGES],
        },
    ],
};
exports.default = report;
