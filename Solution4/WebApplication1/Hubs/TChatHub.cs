using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace WebApplication1.Hubs
{
    public class TChatHub : Hub<IChatClient>
    {
        public Task Send(string message)
        {
            return Clients.All.Send(message);
        }

    }

    public interface IChatClient
    {
        Task Send(string message);
    }
}
