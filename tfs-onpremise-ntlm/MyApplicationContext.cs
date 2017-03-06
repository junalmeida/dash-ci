using System;
using System.Windows.Forms;
using TfsOnPremiseNtlm.Properties;

namespace TfsOnPremiseNtlm
{
    public class MyApplicationContext : ApplicationContext
    {
        private NotifyIcon trayIcon;

        public MyApplicationContext()
        {
            // Initialize Tray Icon
            trayIcon = new NotifyIcon()
            {
                Icon = Resources.PerfCenterCpl,
                ContextMenu = new ContextMenu(new MenuItem[] {
                new MenuItem("Exit", Exit)
            }),
                Visible = true
            };
        }

        void Exit(object sender, EventArgs e)
        {
            // Hide tray icon, otherwise it will remain shown until user mouses over it
            trayIcon.Visible = false;
            if (Program.server != null)
                Program.server.Dispose();
            Application.Exit();
        }
    }
}
