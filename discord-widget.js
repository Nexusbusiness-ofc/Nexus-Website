// DISCORD LIVE WIDGET INTEGRATION

(function() {
    // Default Discord Server ID (using user's Discord Server ID)
    const DEFAULT_GUILD_ID = "1157231609918013440";
    let activeGuildId = localStorage.getItem('nexus_discord_guild_id') || DEFAULT_GUILD_ID;

    // Elements
    const serverNameEl = document.getElementById('discord-server-name');
    const onlineCountEl = document.getElementById('discord-online-count');
    const membersCountEl = document.getElementById('discord-members-count');
    const channelsListEl = document.getElementById('discord-channels');
    const membersListEl = document.getElementById('discord-members');
    const inviteBtnEl = document.getElementById('discord-invite-btn');
    const serverIconEl = document.getElementById('discord-icon');
    
    // Settings Elements
    const toggleSettingsBtn = document.getElementById('toggle-discord-settings-btn');
    const settingsForm = document.getElementById('discord-settings-form');
    const guildIdInput = document.getElementById('discord-guild-id-input');
    const saveBtn = document.getElementById('save-discord-guild-btn');
    const resetBtn = document.getElementById('reset-discord-guild-btn');

    // Fetch and render Discord widget data
    async function fetchDiscordData() {
        showLoadingState();

        try {
            const response = await fetch(`https://discord.com/api/widgets/${activeGuildId}/widget.json`);
            
            if (!response.ok) {
                throw new Error("Widget não encontrado ou desativado para este Servidor ID.");
            }

            const data = await response.ok ? await response.json() : null;
            if (!data) return;

            renderServer(data);
        } catch (error) {
            console.error("Erro ao carregar dados do Discord:", error);
            renderError(error.message);
        }
    }

    // Render loading state
    function showLoadingState() {
        const shimmerHtml = `
            <div class="discord-loading-shimmer"></div>
            <div class="discord-loading-shimmer"></div>
            <div class="discord-loading-shimmer"></div>
        `;
        channelsListEl.innerHTML = shimmerHtml;
        membersListEl.innerHTML = shimmerHtml + shimmerHtml;
        serverNameEl.textContent = "Carregando...";
        onlineCountEl.textContent = "0 Online";
        membersCountEl.textContent = "0";
    }

    // Render server details
    function renderServer(data) {
        // 1. Server Name
        serverNameEl.textContent = data.name;
        
        // 2. Online Count
        onlineCountEl.textContent = `${data.presence_count} Online`;
        membersCountEl.textContent = data.presence_count;

        // 3. Server Icon (First letter if no image)
        const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        serverIconEl.innerHTML = `<span class="discord-server-initials">${initials}</span>`;
        serverIconEl.style.backgroundImage = 'none';

        // 4. Invite link
        if (data.instant_invite) {
            inviteBtnEl.href = data.instant_invite;
            inviteBtnEl.classList.remove('hidden');
        } else {
            inviteBtnEl.removeAttribute('href');
            inviteBtnEl.href = "#";
            inviteBtnEl.title = "Convite instantâneo desativado no painel do widget.";
        }

        // 5. Channels & Voice Channels structure
        channelsListEl.innerHTML = '';
        if (!data.channels || data.channels.length === 0) {
            channelsListEl.innerHTML = `<div class="discord-channel-item"><i data-lucide="info"></i><span>Nenhum canal público visível</span></div>`;
        } else {
            // Sort channels by position
            const sortedChannels = [...data.channels].sort((a, b) => a.position - b.position);
            
            sortedChannels.slice(0, 10).forEach(channel => {
                // Find if anyone is in this voice channel
                const usersInChannel = data.members.filter(m => m.channel_id === channel.id);
                
                const channelItem = document.createElement('div');
                channelItem.className = 'discord-channel-item-wrapper';
                
                let isVoice = usersInChannel.length > 0 || channel.name.toLowerCase().includes('voice') || channel.name.toLowerCase().includes('call');
                let iconName = isVoice ? 'volume-2' : 'hash';

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

        // 6. Online Members List
        membersListEl.innerHTML = '';
        if (!data.members || data.members.length === 0) {
            membersListEl.innerHTML = `<div class="discord-no-members">Nenhum membro visível online.</div>`;
        } else {
            // Display up to 50 members to keep layout light
            data.members.slice(0, 48).forEach(member => {
                const memberCard = document.createElement('div');
                memberCard.className = 'discord-member-card';

                // Status mapping
                let statusClass = 'online';
                if (member.status === 'idle') statusClass = 'idle';
                if (member.status === 'dnd') statusClass = 'dnd';

                // Game activity
                let activityText = 'Online';
                if (member.game) {
                    activityText = member.game.name;
                } else if (member.status === 'idle') {
                    activityText = 'Ausente';
                } else if (member.status === 'dnd') {
                    activityText = 'Não perturbar';
                }

                memberCard.innerHTML = `
                    <div class="member-avatar-wrapper">
                        <img src="${member.avatar_url}" class="member-avatar" alt="${member.username}">
                        <div class="member-status-dot ${statusClass}"></div>
                    </div>
                    <div class="member-info">
                        <span class="member-name">${member.username}</span>
                        <span class="member-activity">${activityText}</span>
                    </div>
                `;
                
                membersListEl.appendChild(memberCard);
            });
        }

        // Re-run Lucide Icons rendering on new elements
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Render error layout
    function renderError(message) {
        serverNameEl.textContent = "Erro de Conexão";
        onlineCountEl.textContent = "Offline";
        membersCountEl.textContent = "!";
        
        channelsListEl.innerHTML = `
            <div class="discord-error-box">
                <i data-lucide="alert-triangle" style="color: #f59e0b; margin-bottom: 0.5rem; width: 24px; height: 24px;"></i>
                <p style="font-size: 0.85rem; color: var(--color-text-muted);">Não foi possível carregar o servidor Discord.</p>
            </div>
        `;
        
        membersListEl.innerHTML = `
            <div class="discord-error-box" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p style="color: #ef4444; font-weight: 500; margin-bottom: 0.8rem;">ID: ${activeGuildId}</p>
                <p style="font-size: 0.9rem; color: var(--color-text-muted); max-width: 400px; margin: 0 auto;">
                    Verifique se o ID está correto e se a opção <strong>"Habilitar Widget do Servidor"</strong> está ativa nas configurações do seu servidor do Discord.
                </p>
            </div>
        `;
        
        inviteBtnEl.classList.add('hidden');
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Bind event listeners
    function bindEvents() {
        // Toggle settings form
        toggleSettingsBtn.addEventListener('click', () => {
            settingsForm.classList.toggle('hidden');
            guildIdInput.value = activeGuildId;
        });

        // Save new Guild ID
        saveBtn.addEventListener('click', () => {
            const inputVal = guildIdInput.value.trim();
            if (inputVal && /^\d+$/.test(inputVal)) {
                activeGuildId = inputVal;
                localStorage.setItem('nexus_discord_guild_id', activeGuildId);
                settingsForm.classList.add('hidden');
                fetchDiscordData();
            } else {
                alert("Por favor, insira um ID de Servidor do Discord válido (apenas números).");
            }
        });

        // Reset to default
        resetBtn.addEventListener('click', () => {
            activeGuildId = DEFAULT_GUILD_ID;
            localStorage.removeItem('nexus_discord_guild_id');
            guildIdInput.value = DEFAULT_GUILD_ID;
            settingsForm.classList.add('hidden');
            fetchDiscordData();
        });
    }

    // Expose initialization globally
    window.initDiscordWidget = function() {
        bindEvents();
        fetchDiscordData();
        
        // Auto-refresh Discord widget every 45 seconds (to keep it real-time)
        setInterval(fetchDiscordData, 45000);
    };

})();
