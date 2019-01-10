using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Models;

namespace WebApplication1.Hubs
{
    public class DynamicChatHub : DynamicHub
    {
        public async Task SendMessage(ChatMessage message)
        {
            await Clients.All.Send(message);
        }
    }
}
