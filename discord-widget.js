// DISCORD LIVE WIDGET & IFRAME INTEGRATION
(function() {
    const DEFAULT_GUILD_ID = "1157231609918013440";
    let activeGuildId = localStorage.getItem('nexus_discord_guild_id') || DEFAULT_GUILD_ID;

    // Elements
    const onlineCountEl = document.getElementById('discord-online-count');
    const channelsListEl = document.getElementById('discord-channels');
    const iframeEl = document.querySelector('.discord-iframe');
    
    // Settings Elements
    const toggleSettingsBtn = document.getElementById('toggle-discord-settings-btn');
    const settingsForm = document.getElementById('discord-settings-form');
    const guildIdInput = document.getElementById('discord-guild-id-input');
    const saveBtn = document.getElementById('save-discord-guild-btn');
    const resetBtn = document.getElementById('reset-discord-guild-btn');

    // Fetch and render Discord JSON API data
    async function fetchDiscordData() {
        showLoadingState();

        try {
            const response = await fetch(`https://discord.com/api/guilds/${activeGuildId}/widget.json`);
            
            if (!response.ok) {
                throw new Error("Widget não encontrado ou desativado.");
            }

            const data = await response.json();
            renderServer(data);
        } catch (error) {
            console.error("Erro ao carregar dados do Discord:", error);
            renderError(error.message);
        }
    }

    // Render loading state
    function showLoadingState() {
        if (channelsListEl) {
            channelsListEl.innerHTML = `
                <div class="discord-loading-shimmer"></div>
                <div class="discord-loading-shimmer"></div>
                <div class="discord-loading-shimmer"></div>
            `;
        }
        if (onlineCountEl) {
            onlineCountEl.textContent = "Carregando...";
        }
    }

    // Render server details
    function renderServer(data) {
        // 1. Online Count
        if (onlineCountEl) {
            onlineCountEl.textContent = `${data.presence_count} Online`;
        }

        // 2. Update iframe src if needed (to keep in sync)
        if (iframeEl) {
            const currentSrc = iframeEl.getAttribute('src');
            const targetSrc = `https://discord.com/widget?id=${activeGuildId}&theme=dark`;
            if (currentSrc !== targetSrc) {
                iframeEl.src = targetSrc;
            }
        }

        // 3. Channels & Voice Channels structure
        if (channelsListEl) {
            channelsListEl.innerHTML = '';
            
            if (!data.channels || data.channels.length === 0) {
                channelsListEl.innerHTML = `<div class="discord-channel-item"><i data-lucide="info"></i><span>Nenhum canal de voz ativo</span></div>`;
            } else {
                // Filter and sort voice channels
                const sortedChannels = [...data.channels].sort((a, b) => a.position - b.position);
                
                sortedChannels.forEach(channel => {
                    // Check if there are members in this channel
                    const usersInChannel = data.members ? data.members.filter(m => m.channel_id === channel.id) : [];
                    
                    const channelItem = document.createElement('div');
                    channelItem.className = 'discord-channel-item-wrapper';
                    
                    // Standard channel icon
                    const isVoice = usersInChannel.length > 0 || channel.name.toLowerCase().includes('call') || channel.name.toLowerCase().includes('suporte');
                    const iconName = isVoice ? 'volume-2' : 'hash';

                    let voiceMembersHtml = '';
                    if (usersInChannel.length > 0) {
                        voiceMembersHtml = `
                            <div class="voice-users-list">
                                ${usersInChannel.map(user => `
                                    <div class="voice-user">
                                        <img src="${user.avatar_url}" class="voice-avatar" alt="${user.username}">
                                        <span>${user.username}</span>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    }

                    channelItem.innerHTML = `
                        <div class="discord-channel-item">
                            <i data-lucide="${iconName}"></i>
                            <span>${channel.name}</span>
                            ${usersInChannel.length > 0 ? `<span class="voice-badge">LIVE</span>` : ''}
                        </div>
                        ${voiceMembersHtml}
                    `;
                    
                    channelsListEl.appendChild(channelItem);
                });
            }
        }

        // Re-run Lucide Icons rendering on new elements
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Render error layout
    function renderError(message) {
        if (onlineCountEl) {
            onlineCountEl.textContent = "Offline";
        }
        
        if (channelsListEl) {
            channelsListEl.innerHTML = `
                <div class="discord-error-box">
                    <i data-lucide="alert-triangle" style="color: #f59e0b; margin-bottom: 0.5rem; width: 24px; height: 24px;"></i>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">Não foi possível carregar os canais. Verifique se o widget está ativo nas configurações do servidor.</p>
                </div>
            `;
        }
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Bind event listeners
    function bindEvents() {
        if (toggleSettingsBtn && settingsForm) {
            toggleSettingsBtn.addEventListener('click', () => {
                settingsForm.classList.toggle('hidden');
                if (guildIdInput) {
                    guildIdInput.value = activeGuildId;
                }
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const inputVal = guildIdInput ? guildIdInput.value.trim() : '';
                if (inputVal && /^\d+$/.test(inputVal)) {
                    activeGuildId = inputVal;
                    localStorage.setItem('nexus_discord_guild_id', activeGuildId);
                    if (settingsForm) {
                        settingsForm.classList.add('hidden');
                    }
                    fetchDiscordData();
                } else {
                    alert("Por favor, insira um ID de Servidor do Discord válido (apenas números).");
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                activeGuildId = DEFAULT_GUILD_ID;
                localStorage.removeItem('nexus_discord_guild_id');
                if (guildIdInput) {
                    guildIdInput.value = DEFAULT_GUILD_ID;
                }
                if (settingsForm) {
                    settingsForm.classList.add('hidden');
                }
                fetchDiscordData();
            });
        }
    }

    // Expose initialization globally
    window.initDiscordWidget = function() {
        bindEvents();
        fetchDiscordData();
        
        // Auto-refresh every 45 seconds
        setInterval(fetchDiscordData, 45000);
    };

})();
