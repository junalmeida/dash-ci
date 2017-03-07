using System;
using System.Diagnostics;
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
                Text = "Dash-CI",
                ContextMenu = new ContextMenu(new MenuItem[] {
                    new MenuItem("Open", Open) { DefaultItem = true },
                    new MenuItem("Exit", Exit)
                }),
                Visible = true
            };
            trayIcon.DoubleClick += Open;
        }

        void Exit(object sender, EventArgs e)
        {
            // Hide tray icon, otherwise it will remain shown until user mouses over it
            trayIcon.Visible = false;
            if (Program.server != null)
                Program.server.Dispose();
            Application.Exit();
        }
        void Open(object sender, EventArgs e)
        {
            Process.Start(new ProcessStartInfo()
            {
                FileName = Program.BaseUrl + "/",
                UseShellExecute = true
            });
        }
    }
}
