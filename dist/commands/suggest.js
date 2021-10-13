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
const suggest = {
    name: "suggest",
    interaction: {
        description: "Create a suggestion.",
        options: [
            {
                type: "STRING",
                name: "description",
                description: "A description of the suggestion.",
                required: true,
            },
            {
                type: "STRING",
                name: "link",
                description: "Additional context in the form of a link or screenshot.",
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
                !suggest.buttons)
                return;
            const guild = yield (0, globals_1.getGuild)(interaction.guildId);
            if (!guild)
                return;
            const guildInfo = globals_1.guildCache.find(guild => guild.id == interaction.guildId);
            if (!guildInfo)
                return;
            const bot = interaction.guild.me;
            const uploadChannel = (_a = (yield interaction.guild.channels.fetch(guild.settings.suggestions.upload))) !== null && _a !== void 0 ? _a : interaction.channel;
            if (!uploadChannel ||
                uploadChannel.type != "GUILD_TEXT" ||
                !bot ||
                !bot.permissionsIn(uploadChannel).has("VIEW_CHANNEL") ||
                !bot.permissionsIn(uploadChannel).has("SEND_MESSAGES"))
                return;
            const newSuggestion = {
                id: guildInfo.suggestions.length.toString(),
                messageId: "",
                channelId: "",
                threadId: "",
                status: "open",
                author: {
                    id: interaction.user.id,
                    time: new Date().toLocaleString(),
                },
            };
            yield guild.uploadSuggestion(newSuggestion);
            const description = interaction.options.getString("description");
            const avatarURL = interaction.user.avatarURL();
            if (!description || !avatarURL)
                return;
            const row = new discord_js_1.MessageActionRow();
            suggest.buttons.forEach(data => {
                row.addComponents(data.button);
            });
            const embed = new discord_js_1.MessageEmbed()
                .setAuthor(interaction.user.username + "#" + interaction.user.discriminator, avatarURL)
                .setDescription(description)
                .addField("Status", "Open", true)
                .setFooter(`id: ${newSuggestion.id}`)
                .setTimestamp()
                .setColor(interaction.member.displayColor)
                .setThumbnail("https://i.imgur.com/OMEaEYY.png");
            const link = interaction.options.getString("link");
            if (link && (link.startsWith("https://") || link.startsWith("http://") || link.startsWith("www."))) {
                embed.addField("Additional Context", link, true);
            }
            const message = yield uploadChannel.send({
                embeds: [embed],
                components: [row],
            });
            yield message.react("👍"), yield message.react("👎");
            const thread = yield uploadChannel.threads.create({
                startMessage: message,
                name: `Suggestion ${newSuggestion.id}`,
                autoArchiveDuration: 1440,
                type: "GUILD_PUBLIC_THREAD",
            });
            (newSuggestion.threadId = thread.id),
                (newSuggestion.messageId = message.id),
                (newSuggestion.channelId = message.channelId);
            yield guild.updateSuggestion(newSuggestion);
            yield interaction.reply({
                ephemeral: true,
                content: `Suggestion has been created, discussion can be found at <#${thread.id}>`,
            });
        }),
    },
    buttons: [
        {
            button: new discord_js_1.MessageButton()
                .setCustomId("approveSuggestion")
                .setLabel("Approve")
                .setStyle("SUCCESS")
                .setDisabled(false),
            callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
                if (!interaction.guildId || !interaction.guild)
                    return;
                const guild = yield (0, globals_1.getGuild)(interaction.guildId);
                if (!guild)
                    return;
                const cachedSuggestion = guild.suggestions.find(suggestion => suggestion.messageId == interaction.message.id);
                if (!cachedSuggestion)
                    return;
                const channel = yield interaction.guild.channels.fetch(cachedSuggestion.channelId);
                if (!channel || channel.type != "GUILD_TEXT")
                    return;
                const thread = yield channel.threads.fetch(cachedSuggestion.threadId);
                if (!thread)
                    return;
                yield interaction.deferUpdate();
                const message = yield channel.messages.fetch(cachedSuggestion.messageId);
                const embed = message.embeds[0];
                const statusField = embed.fields.find(field => field.name == "Status");
                if (!statusField)
                    return;
                statusField.value = `Approved by <@${interaction.user.id}>`;
                const row = new discord_js_1.MessageActionRow();
                if (suggest.buttons) {
                    for (const button of suggest.buttons.map(data => data.button)) {
                        if (button.customId == "approveSuggestion") {
                            button.setDisabled(true);
                        }
                        row.addComponents(button);
                    }
                }
                yield message.edit({
                    embeds: [embed],
                    components: [row],
                });
                cachedSuggestion.status = "approved";
                yield guild.updateSuggestion(cachedSuggestion);
            }),
            permissions: [discord_js_1.Permissions.FLAGS.MANAGE_MESSAGES],
        },
        {
            button: new discord_js_1.MessageButton()
                .setCustomId("denySuggestion")
                .setLabel("Deny")
                .setStyle("DANGER")
                .setDisabled(false),
            callback: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
                if (!interaction.guildId || !interaction.guild)
                    return;
                const guild = yield (0, globals_1.getGuild)(interaction.guildId);
                if (!guild)
                    return;
                const cachedSuggestion = guild.suggestions.find(suggestion => suggestion.messageId == interaction.message.id);
                if (!cachedSuggestion)
                    return;
                const channel = yield interaction.guild.channels.fetch(cachedSuggestion.channelId);
                if (!channel || channel.type != "GUILD_TEXT")
                    return;
                const thread = yield channel.threads.fetch(cachedSuggestion.threadId);
                if (!thread)
                    return;
                yield interaction.deferUpdate();
                const message = yield channel.messages.fetch(cachedSuggestion.messageId);
                const embed = message.embeds[0];
                const statusField = embed.fields.find(field => field.name == "Status");
                if (!statusField)
                    return;
                statusField.value = `Denied by <@${interaction.user.id}>`;
                const row = new discord_js_1.MessageActionRow();
                if (suggest.buttons) {
                    for (const button of suggest.buttons.map(data => data.button)) {
                        if (button.customId == "denySuggestion") {
                            button.setDisabled(true);
                        }
                        row.addComponents(button);
                    }
                }
                yield message.edit({
                    embeds: [embed],
                    components: [row],
                });
                cachedSuggestion.status = "denied";
                yield guild.updateSuggestion(cachedSuggestion);
            }),
            permissions: [discord_js_1.Permissions.FLAGS.MANAGE_MESSAGES],
        },
    ],
};
exports.default = suggest;
